import "server-only";
import { MAX_IMAGE_BYTES } from "@/lib/image/constants";
import { ApiError } from "./errors";

// Room for the text fields and multipart boundaries on top of the image itself.
const MAX_BODY_BYTES = MAX_IMAGE_BYTES + 256 * 1024;

/**
 * Reads a multipart form with text fields and an optional `image` file.
 * The declared body size is checked before anything is buffered.
 */
export async function readMultipart(request: Request) {
  const length = request.headers.get("content-length");
  if (!length) throw new ApiError(411, "Header Content-Length wajib ada.");
  if (Number(length) > MAX_BODY_BYTES) {
    throw new ApiError(413, "Ukuran file maksimal 3 MB.", { image: ["Ukuran file maksimal 3 MB."] });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, "Format form tidak valid.");
  }

  const fields: Record<string, string> = {};
  let image: File | null = null;
  for (const [name, value] of form) {
    if (typeof value === "string") fields[name] = value;
    else if (name === "image" && value.size > 0) image = value;
  }
  return { fields, image };
}
