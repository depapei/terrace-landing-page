import { z } from "zod";
import { formBoolean, optionalExternalUrl, slugField, sortOrder, textField } from "@/lib/validation/common";

export const MAX_PORTFOLIO_IMAGES = 3;

export const PORTFOLIO_TYPES = ["WEBSITE", "MOBILE_APP", "UI_UX_DESIGN", "OTHER"] as const;
export type PortfolioTypeValue = (typeof PORTFOLIO_TYPES)[number];

export const PORTFOLIO_TYPE_LABELS: Record<PortfolioTypeValue, string> = {
  WEBSITE: "Website",
  MOBILE_APP: "Aplikasi mobile",
  UI_UX_DESIGN: "Desain UI/UX",
  OTHER: "Lainnya",
};

/** Multipart field names for newly uploaded images, referenced from the manifest. */
export const UPLOAD_FIELDS = ["image_0", "image_1", "image_2"] as const;

const imageCount = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .min(1, "Minimal 1 gambar proyek.")
    .max(MAX_PORTFOLIO_IMAGES, `Maksimal ${MAX_PORTFOLIO_IMAGES} gambar proyek.`);

const altText = textField("Alt text", 200);

const baseFields = {
  title: textField("Judul proyek", 120),
  slug: slugField,
  type: z.enum(PORTFOLIO_TYPES, { error: "Pilih tipe hasil kerja." }),
  liveUrl: optionalExternalUrl,
  description: textField("Deskripsi proyek", 2000),
  duration: textField("Durasi", 60),
  sortOrder,
};

/** Websites must link to the live site or a demo. */
function checkLiveUrl(value: { type: PortfolioTypeValue; liveUrl: string | null }, ctx: z.RefinementCtx) {
  if (value.type === "WEBSITE" && !value.liveUrl) {
    ctx.addIssue({ code: "custom", path: ["liveUrl"], message: "Link live/demo wajib diisi untuk website." });
  }
}

/** Server-side text fields (multipart strings). */
export const portfolioSchema = z.object({ ...baseFields, isActive: formBoolean }).superRefine(checkLiveUrl);

/**
 * Ordered image list sent as JSON in the `images` field. Each entry keeps an
 * existing image (`id`) or adds a new upload (`upload` names the file field).
 * The first entry is the card thumbnail.
 */
export const portfolioImagesSchema = imageCount(
  z
    .object({
      id: z.string().regex(/^[a-z0-9]{20,40}$/i, "Gambar tidak valid.").nullable().default(null),
      upload: z.enum(UPLOAD_FIELDS).nullable().default(null),
      altText,
    })
    .refine((entry) => (entry.id === null) !== (entry.upload === null), "Gambar tidak valid."),
).superRefine((entries, ctx) => {
  const ids = entries.flatMap((e) => (e.id ? [e.id] : []));
  const uploads = entries.flatMap((e) => (e.upload ? [e.upload] : []));
  if (new Set(ids).size !== ids.length || new Set(uploads).size !== uploads.length) {
    ctx.addIssue({ code: "custom", message: "Gambar yang sama tidak boleh dipakai dua kali." });
  }
});

/** Client form schema. Files live outside RHF, keyed by `key`. */
export const portfolioFormSchema = z.object({
  ...baseFields,
  isActive: z.boolean(),
  images: imageCount(z.object({ key: z.string(), existingId: z.string().nullable(), altText })),
}).superRefine(checkLiveUrl);

export type PortfolioInput = z.output<typeof portfolioSchema>;
export type PortfolioImageManifest = z.output<typeof portfolioImagesSchema>;
export type PortfolioFormInput = z.input<typeof portfolioFormSchema>;
export type PortfolioFormValues = z.output<typeof portfolioFormSchema>;

export type PortfolioImageDto = {
  id: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  altText: string;
};

export type PortfolioDto = {
  id: string;
  title: string;
  slug: string;
  type: PortfolioTypeValue;
  liveUrl: string | null;
  description: string;
  duration: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
  images: PortfolioImageDto[];
};
