import { z } from "zod";
import { formBoolean, optionalExternalUrl, sortOrder, textField } from "@/lib/validation/common";

export const partnerSchema = z.object({
  name: textField("Nama mitra", 120),
  websiteUrl: optionalExternalUrl,
  altText: textField("Alt text", 200),
  sortOrder,
  isActive: formBoolean,
});

export type PartnerInput = z.output<typeof partnerSchema>;

export type PartnerDto = {
  id: string;
  name: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  websiteUrl: string | null;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
