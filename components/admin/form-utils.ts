import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "@/lib/axios";

/**
 * Maps server validation errors onto form fields. Returns a top-level message
 * for errors that don't belong to a field, and the image error if any.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
) {
  if (!(error instanceof ApiClientError)) return { formError: "Terjadi kesalahan.", imageError: undefined };
  let imageError: string | undefined;
  let matched = false;
  for (const [name, messages] of Object.entries(error.fieldErrors ?? {})) {
    const message = messages?.[0];
    if (!message) continue;
    if (name === "image") {
      imageError = message;
      matched = true;
    } else if (fields.includes(name)) {
      setError(name as Path<T>, { type: "server", message });
      matched = true;
    }
  }
  return { formError: matched ? null : error.message, imageError };
}

/** Builds a multipart body from validated values plus an optional image. */
export function toFormData(values: Record<string, unknown>, image: File | null) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.append(key, value === null || value === undefined ? "" : String(value));
  }
  if (image) data.append("image", image);
  return data;
}
