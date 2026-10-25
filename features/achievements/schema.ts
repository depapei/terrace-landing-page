import { z } from "zod";
import {
  formBoolean,
  optionalExternalUrl,
  optionalText,
  sortOrder,
  textField,
} from "@/lib/validation/common";

export const achievementSchema = z.object({
  name: textField("Nama badge", 120),
  description: optionalText(300),
  issuer: optionalText(120),
  credentialUrl: optionalExternalUrl,
  altText: textField("Alt text", 200),
  sortOrder,
  isActive: formBoolean,
});

export type AchievementInput = z.output<typeof achievementSchema>;

export type AchievementDto = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  altText: string;
  issuer: string | null;
  credentialUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
