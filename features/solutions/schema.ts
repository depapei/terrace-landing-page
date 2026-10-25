import { z } from "zod";
import { ctaUrl, optionalText, slugField, sortOrder, textField } from "@/lib/validation/common";

export const PRICING_TYPES = ["FIXED_RANGE", "CONSULTATION"] as const;
export type PricingTypeValue = (typeof PRICING_TYPES)[number];

const MAX_PRICE = 1_000_000_000_000;

const price = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.coerce
    .number({ error: "Harga harus berupa angka." })
    .int("Harga harus bilangan bulat (Rupiah).")
    .min(0, "Harga tidak boleh negatif.")
    .max(MAX_PRICE, "Harga terlalu besar.")
    .nullable(),
);

const baseFields = {
  name: textField("Nama paket", 120),
  slug: slugField,
  label: optionalText(80),
  badge: optionalText(40),
  description: textField("Deskripsi", 600),
  pricingType: z.enum(PRICING_TYPES, { error: "Pilih jenis harga." }),
  priceMin: price,
  priceMax: price,
  pricingLabel: textField("Label harga", 80),
  pricingNote: optionalText(80),
  ctaLabel: textField("Label CTA", 60),
  ctaUrl,
  isFeatured: z.boolean(),
  sortOrder,
  isActive: z.boolean(),
};

const feature = z.string().trim().min(1, "Fitur tidak boleh kosong.").max(160, "Maksimal 160 karakter.");

type PriceShape = { pricingType: PricingTypeValue; priceMin: number | null; priceMax: number | null };

function checkPricing(value: PriceShape, ctx: z.RefinementCtx) {
  if (value.pricingType !== "FIXED_RANGE") return;
  if (value.priceMin === null) {
    ctx.addIssue({ code: "custom", path: ["priceMin"], message: "Harga minimum wajib diisi." });
  }
  if (value.priceMax === null) {
    ctx.addIssue({ code: "custom", path: ["priceMax"], message: "Harga maksimum wajib diisi." });
  }
  if (value.priceMin !== null && value.priceMax !== null && value.priceMax < value.priceMin) {
    ctx.addIssue({
      code: "custom",
      path: ["priceMax"],
      message: "Harga maksimum tidak boleh lebih kecil dari harga minimum.",
    });
  }
}

/** Consultation-based packages never store prices. */
function normalizePricing<T extends PriceShape>(value: T): T {
  return value.pricingType === "CONSULTATION" ? { ...value, priceMin: null, priceMax: null } : value;
}

/** Server-side (JSON API) schema. */
export const solutionSchema = z
  .object({ ...baseFields, features: z.array(feature).max(12, "Maksimal 12 fitur.") })
  .superRefine(checkPricing)
  .transform(normalizePricing);

/** Client form schema: features are objects so they work with useFieldArray. */
export const solutionFormSchema = z
  .object({
    ...baseFields,
    features: z.array(z.object({ value: feature })).max(12, "Maksimal 12 fitur."),
  })
  .superRefine(checkPricing);

export type SolutionInput = z.output<typeof solutionSchema>;
export type SolutionFormInput = z.input<typeof solutionFormSchema>;
export type SolutionFormValues = z.output<typeof solutionFormSchema>;

export type SolutionDto = {
  id: string;
  name: string;
  slug: string;
  label: string | null;
  badge: string | null;
  description: string;
  pricingType: PricingTypeValue;
  priceMin: number | null;
  priceMax: number | null;
  pricingLabel: string;
  pricingNote: string | null;
  features: string[];
  ctaLabel: string;
  ctaUrl: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
