import { z } from "zod";
import { externalUrl, optionalText, textField } from "@/lib/validation/common";

export const contactTypes = ["EMAIL", "WHATSAPP", "INSTAGRAM", "WEBSITE", "GOOGLE_MAPS", "OTHER"] as const;
export const leadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "CONVERTED", "LOST"] as const;
export const leadSources = ["POTENTIAL", "SELF_FORM"] as const;
export type LeadContactType = (typeof contactTypes)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type LeadSource = (typeof leadSources)[number];

export const contactLabels: Record<LeadContactType, string> = {
  EMAIL: "Email", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram", WEBSITE: "Website", GOOGLE_MAPS: "Google Maps", OTHER: "Lainnya",
};
export const statusLabels: Record<LeadStatus, string> = {
  NEW: "New", CONTACTED: "Contacted", FOLLOW_UP: "Follow Up", INTERESTED: "Interested", CONVERTED: "Converted", LOST: "Lost",
};

/** Accept a country-code number (e.g. +62...), never guess a visitor's country. */
export function normalizeWhatsApp(value: string) {
  return value.replace(/[\s()+.-]/g, "");
}

function checkContact(input: { contactType: LeadContactType; contactValue: string }, ctx: z.RefinementCtx) {
  let valid = true;
  let message = "Kontak tidak valid.";
  switch (input.contactType) {
    case "EMAIL":
      valid = z.email().safeParse(input.contactValue).success;
      message = "Masukkan alamat email yang valid.";
      break;
    case "WHATSAPP":
      valid = /^[+\d\s().-]+$/.test(input.contactValue) && /^[1-9]\d{7,14}$/.test(normalizeWhatsApp(input.contactValue));
      message = "Gunakan nomor dengan kode negara, contoh +6281234567890 (8–15 digit).";
      break;
    case "WEBSITE":
    case "GOOGLE_MAPS":
      valid = externalUrl.safeParse(input.contactValue).success;
      message = "Gunakan URL lengkap http:// atau https://.";
      break;
    case "INSTAGRAM":
      valid = /^@?[A-Za-z0-9._]{1,30}$/.test(input.contactValue) || (() => {
        try {
          const url = new URL(input.contactValue);
          return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && url.pathname !== "/";
        } catch { return false; }
      })();
      message = "Masukkan username Instagram atau URL profil https://instagram.com/...";
  }
  if (!valid) ctx.addIssue({ code: "custom", path: ["contactValue"], message });
}

const contactFields = {
  companyName: textField("Nama perusahaan", 160),
  contactType: z.enum(contactTypes),
  contactValue: textField("Kontak", 500),
};

// Creation cannot override server-owned source or initial NEW status.
export const potentialLeadSchema = z.object({
  ...contactFields,
  requirements: optionalText(2000),
  internalNotes: optionalText(5000),
}).strict().superRefine(checkContact);

export const potentialLeadUpdateSchema = z.object({
  ...contactFields,
  requirements: optionalText(2000),
  internalNotes: optionalText(5000),
  status: z.enum(leadStatuses),
}).strict().superRefine(checkContact);

// Also used for Self Form updates: original customer details remain immutable.
export const leadProgressSchema = z.object({
  status: z.enum(leadStatuses),
  internalNotes: optionalText(5000),
}).strict();

const publicFields = {
  ...contactFields,
  contactType: z.enum(["WHATSAPP", "EMAIL"]),
  requirements: textField("Kebutuhan proyek", 2000),
  // Honeypot, rendered off-screen. Genuine visitors leave it blank.
  website: z.string().max(0, "Permintaan ditolak."),
};
export const publicLeadFormSchema = z.object(publicFields).strict().superRefine(checkContact);
export const publicLeadSchema = z.object({ ...publicFields, submissionKey: z.uuid() }).strict().superRefine(checkContact);

export const leadListSchema = z.object({
  source: z.enum(leadSources).default("POTENTIAL"),
  status: z.enum(leadStatuses).optional(),
  search: z.string().trim().max(160).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
}).strict();

export type PotentialLeadInput = z.output<typeof potentialLeadSchema>;
export type PotentialLeadUpdate = z.output<typeof potentialLeadUpdateSchema>;
export type LeadProgressInput = z.output<typeof leadProgressSchema>;
export type PublicLeadInput = z.output<typeof publicLeadSchema>;
export type LeadListInput = z.output<typeof leadListSchema>;

export type LeadSummary = {
  id: string;
  companyName: string;
  contactType: LeadContactType;
  contactValue: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};
export type LeadDetail = LeadSummary & { requirements: string | null; internalNotes: string | null };
export type LeadListResult = { items: LeadSummary[]; total: number; page: number; pageSize: number };
export type PublicLeadResult = { ok: true; whatsappUrl: string | null };
