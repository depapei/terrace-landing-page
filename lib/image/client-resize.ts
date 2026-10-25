import type { ImageFolder } from "@/lib/storage/types";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_WIDTH, validateImageFile } from "./constants";

// High quality: the server re-encodes once more with sharp, so this pass only has to shrink the upload.
const CLIENT_QUALITY = 0.92;

/**
 * Browser-side downscale to the folder's stored width, encoded as WebP, so
 * several images fit in one request (Vercel caps bodies at 4.5 MB). Never
 * upscales. Returns the original file when it is already small enough, when
 * the browser can't decode or encode it, or when the result isn't smaller.
 */
export async function shrinkImage(file: File, folder: ImageFolder): Promise<File> {
  const maxWidth = MAX_IMAGE_WIDTH[folder];
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    if (bitmap.width <= maxWidth && file.type === "image/webp") return file;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", CLIENT_QUALITY));
    // Browsers without WebP encoding fall back to PNG; keep the original then.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]*$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp", lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
}

/**
 * Shrinks a picked file, then validates the result: oversized photos that
 * shrink below the limit are accepted. Returns the file to upload or the problem.
 */
export async function prepareImageUpload(
  file: File,
  folder: ImageFolder,
): Promise<{ file: File; problem: null } | { file: null; problem: string }> {
  const supported = (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
  const ready = supported ? await shrinkImage(file, folder) : file;
  const problem = validateImageFile(ready);
  return problem ? { file: null, problem } : { file: ready, problem: null };
}
