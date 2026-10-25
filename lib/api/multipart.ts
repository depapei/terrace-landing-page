import "server-only";
import { MAX_IMAGE_BYTES, MAX_REQUEST_BYTES, TOO_LARGE_TOTAL_MESSAGE } from "@/lib/image/constants";
import { ApiError } from "./errors";

// Room for the text fields and multipart boundaries on top of the images themselves.
const FIELDS_OVERHEAD_BYTES = 256 * 1024;

/**
 * Reads a multipart form with text fields and up to `maxFiles` image files.
 * The declared body size is checked before anything is buffered.
 * `image` is the conventional single-file field; `files` holds every
 * non-empty file field by name.
 */
export async function readMultipart(request: Request, { maxFiles = 1 }: { maxFiles?: number } = {}) {
  const length = request.headers.get("content-length");
  if (!length) throw new ApiError(411, "Header Content-Length wajib ada.");
  // Never above the hosting limit, even when the per-file limits would add up to more.
  if (Number(length) > Math.min(maxFiles * MAX_IMAGE_BYTES + FIELDS_OVERHEAD_BYTES, MAX_REQUEST_BYTES)) {
    const message = maxFiles > 1 ? TOO_LARGE_TOTAL_MESSAGE : "Ukuran file maksimal 3 MB.";
    throw new ApiError(413, message, { [maxFiles > 1 ? "images" : "image"]: [message] });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, "Format form tidak valid.");
  }

  const fields: Record<string, string> = {};
  const files = new Map<string, File>();
  for (const [name, value] of form) {
    if (typeof value === "string") fields[name] = value;
    else if (value.size > 0) files.set(name, value);
  }
  if (files.size > maxFiles) throw new ApiError(422, "Terlalu banyak file.", { images: ["Terlalu banyak file."] });
  return { fields, image: files.get("image") ?? null, files };
}
