import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const textField = (label: string, max: number) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(max, `Maksimal ${max} karakter.`);

export { optionalText };

/** URL slug: lowercase letters, digits and single hyphens. */
export const slugField = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi.")
  .max(80, "Maksimal 80 karakter.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung.");

/** Absolute http(s) URL for external links (partner websites, credentials). */
export const externalUrl = z
  .string()
  .trim()
  .max(500, "URL terlalu panjang.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Gunakan URL lengkap yang diawali https://");

export const optionalExternalUrl = z
  .union([z.literal(""), externalUrl])
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

/**
 * CTA destinations: on-page anchors, internal paths, http(s), mailto: or tel:.
 * Anything else (javascript:, data:, protocol-relative URLs) is rejected.
 */
export const ctaUrl = z
  .string()
  .trim()
  .min(1, "Tujuan CTA wajib diisi.")
  .max(500, "URL terlalu panjang.")
  .refine((value) => {
    if (/^#[A-Za-z0-9_-]+$/.test(value)) return true;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    try {
      const url = new URL(value);
      return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
    } catch {
      return false;
    }
  }, "Gunakan #anchor, /path, https://, mailto: atau tel:.");

/** Booleans arrive as strings in multipart forms. */
export const formBoolean = z
  .union([z.boolean(), z.enum(["true", "false", "on", "1", "0"])])
  .transform((v) => v === true || v === "true" || v === "on" || v === "1");

export const sortOrder = z.coerce
  .number({ error: "Urutan harus berupa angka." })
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(9999, "Urutan terlalu besar.");

export const reorderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-z0-9]{20,40}$/i)).min(1).max(200),
});

export const activeSchema = z.object({ isActive: z.boolean() });
