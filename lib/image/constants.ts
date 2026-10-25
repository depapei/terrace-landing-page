// Shared by client-side and server-side validation.
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

/** Returns an Indonesian error message, or null when the file is acceptable. */
export function validateImageFile(file: { size: number; type: string }) {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Format tidak didukung. Gunakan JPEG, PNG, atau WebP.";
  }
  if (file.size > MAX_IMAGE_BYTES) return "Ukuran file maksimal 3 MB.";
  if (file.size === 0) return "File kosong.";
  return null;
}
