import "server-only";
import sharp from "sharp";
import { ApiError } from "@/lib/api/errors";
import { deleteQuietly, getStorage, newImageKey, type ImageFolder } from "@/lib/storage";
import { MAX_IMAGE_BYTES, validateImageFile } from "./constants";

// Guards against decompression bombs: oversized images fail before full decode.
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_WIDTH: Record<ImageFolder, number> = { hero: 2400, partners: 600, achievements: 400, portfolio: 1600 };
// Full-bleed images are stretched to the viewport; narrower sources upscale visibly.
const MIN_WIDTH: Partial<Record<ImageFolder, number>> = { hero: 1600 };
// Stored files are served as-is (next/image is unoptimized), so this is the only lossy pass.
const MASTER_QUALITY = 90;

export type StoredImage = { key: string; url: string; width: number; height: number };

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function detectFormat(buf: Buffer) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)) return "png";
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

const MIME_FORMAT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const invalid = (status: number, message: string) => new ApiError(status, message, { image: [message] });

/** Validates an uploaded file and converts it to WebP. The original is discarded. */
export async function convertToWebp(file: File, folder: ImageFolder) {
  const message = validateImageFile(file);
  if (message) throw invalid(file.size > MAX_IMAGE_BYTES ? 413 : 422, message);

  const input = Buffer.from(await file.arrayBuffer());
  if (input.length > MAX_IMAGE_BYTES) throw invalid(413, "Ukuran file maksimal 3 MB.");

  // Never trust the browser's Content-Type or file extension alone.
  const signature = detectFormat(input);
  if (!signature || signature !== MIME_FORMAT[file.type]) {
    throw invalid(422, "Isi file bukan gambar JPEG, PNG, atau WebP yang valid.");
  }

  try {
    const image = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    const meta = await image.metadata();
    if (meta.format !== signature) throw new Error("format mismatch");

    const minWidth = MIN_WIDTH[folder];
    const { width } = meta.autoOrient;
    if (minWidth && width < minWidth) {
      throw invalid(422, `Lebar gambar minimal ${minWidth} px agar tidak buram (saat ini ${width} px).`);
    }

    const { data, info } = await image
      .rotate()
      .resize({ width: MAX_WIDTH[folder], withoutEnlargement: true })
      .webp({ quality: MASTER_QUALITY, smartSubsample: true, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw invalid(422, "Gambar tidak dapat diproses. Pastikan file tidak rusak dan resolusinya wajar.");
  }
}

/** Converts and stores an image, returning its generated key and public URL. */
export async function storeImage(file: File, folder: ImageFolder): Promise<StoredImage> {
  const { buffer, width, height } = await convertToWebp(file, folder);
  const key = newImageKey(folder);
  try {
    await getStorage().put(key, buffer, "image/webp");
  } catch (error) {
    console.error("[storage] put failed", error);
    await deleteQuietly(key);
    throw new ApiError(500, "Gagal menyimpan gambar.");
  }
  return { key, url: getStorage().url(key), width, height };
}

/**
 * Runs a DB write that references a freshly stored image. If the write fails
 * the new file is removed; only after it succeeds is the replaced file removed.
 */
export async function withStoredImage<T>(
  image: StoredImage | null,
  write: () => Promise<T>,
  previousKey?: string | null,
) {
  let result: T;
  try {
    result = await write();
  } catch (error) {
    if (image) await deleteQuietly(image.key);
    throw error;
  }
  if (image && previousKey && previousKey !== image.key) await deleteQuietly(previousKey);
  return result;
}

/** Stores several images in order. If one fails, the ones already stored are removed. */
export async function storeImages(files: File[], folder: ImageFolder): Promise<StoredImage[]> {
  const stored: StoredImage[] = [];
  try {
    for (const file of files) stored.push(await storeImage(file, folder));
  } catch (error) {
    await Promise.all(stored.map((image) => deleteQuietly(image.key)));
    throw error;
  }
  return stored;
}

/**
 * Multi-image variant of withStoredImage: new files are removed if the write
 * fails; `obsoleteKeys` (replaced or removed images) only after it succeeds.
 */
export async function withStoredImages<T>(
  images: StoredImage[],
  write: () => Promise<T>,
  obsoleteKeys: string[] = [],
) {
  let result: T;
  try {
    result = await write();
  } catch (error) {
    await Promise.all(images.map((image) => deleteQuietly(image.key)));
    throw error;
  }
  await Promise.all(obsoleteKeys.map((key) => deleteQuietly(key)));
  return result;
}
