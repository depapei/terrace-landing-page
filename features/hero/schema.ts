import { z } from "zod";
import { formBoolean, optionalText, sortOrder, textField } from "@/lib/validation/common";

export const heroSlideSchema = z.object({
  title: optionalText(120),
  subtitle: optionalText(240),
  altText: textField("Alt text", 200),
  sortOrder,
  isActive: formBoolean,
});

export type HeroSlideInput = z.output<typeof heroSlideSchema>;

export type HeroSlideDto = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
