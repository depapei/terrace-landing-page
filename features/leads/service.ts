import "server-only";
import { createHash } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { ApiError, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { whatsappChatHref } from "@/lib/site-config";
import { normalizeWhatsApp, type PotentialLeadInput, type PotentialLeadUpdate, type LeadProgressInput, type LeadListInput, type PublicLeadInput, type PublicLeadResult } from "./schema";

const summarySelect = {
  id: true, companyName: true, contactType: true, contactValue: true,
  source: true, status: true, createdAt: true, updatedAt: true,
} as const;
const detailSelect = { ...summarySelect, requirements: true, internalNotes: true } as const;
const PAGE_SIZE = 20;

function contactFields(input: PotentialLeadInput | PublicLeadInput) {
  return {
    companyName: input.companyName,
    contactType: input.contactType,
    contactValue: input.contactType === "WHATSAPP" ? normalizeWhatsApp(input.contactValue)
      : input.contactType === "EMAIL" ? input.contactValue.toLowerCase() : input.contactValue,
    requirements: input.requirements,
  };
}

export async function listLeads(input: LeadListInput) {
  const where: Prisma.LeadWhereInput = {
    source: input.source,
    ...(input.status && { status: input.status }),
    ...(input.search && { companyName: { contains: input.search, mode: "insensitive" } }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({ where, select: summarySelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (input.page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.lead.count({ where }),
  ]);
  return { items, total, page: input.page, pageSize: PAGE_SIZE };
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id }, select: detailSelect });
  if (!lead) throw notFound("Lead");
  return lead;
}

export function createPotentialLead(input: PotentialLeadInput) {
  return prisma.lead.create({ data: { ...contactFields(input), internalNotes: input.internalNotes, source: "POTENTIAL", status: "NEW" }, select: detailSelect });
}

export async function updatePotentialLead(id: string, input: PotentialLeadUpdate) {
  // Source in the mutation predicate prevents editing a customer's original submission.
  return prisma.lead.update({ where: { id, source: "POTENTIAL" }, data: { ...contactFields(input), internalNotes: input.internalNotes, status: input.status }, select: detailSelect });
}

export function updateLeadProgress(id: string, input: LeadProgressInput) {
  return prisma.lead.update({ where: { id }, data: { status: input.status, internalNotes: input.internalNotes }, select: detailSelect });
}

export async function deletePotentialLead(id: string) {
  await prisma.lead.delete({ where: { id, source: "POTENTIAL" } });
}

export async function submitPublicLead(input: PublicLeadInput): Promise<PublicLeadResult> {
  const fields = contactFields(input);
  const submissionHash = createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const existing = await prisma.lead.findUnique({ where: { submissionKey: input.submissionKey }, select: { submissionHash: true } });
  if (existing) {
    assertSameSubmission(existing.submissionHash, submissionHash);
  } else {
    try {
      await prisma.lead.create({
        data: { ...fields, source: "SELF_FORM", status: "NEW", submissionKey: input.submissionKey, submissionHash },
        select: { id: true },
      });
    } catch (error) {
      // Concurrent retries can race between the lookup and unique insert.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      const raced = await prisma.lead.findUnique({ where: { submissionKey: input.submissionKey }, select: { submissionHash: true } });
      if (!raced) throw error;
      assertSameSubmission(raced.submissionHash, submissionHash);
    }
  }
  // Never expose a lead record, internal notes, status, or existence by contact.
  return {
    ok: true,
    whatsappUrl: whatsappChatHref(`Halo Terrace Digital, saya dari ${fields.companyName}. Kontak saya: ${fields.contactValue}. Kami membutuhkan: ${fields.requirements}. Saya ingin berdiskusi lebih lanjut.`),
  };
}

function assertSameSubmission(existing: string | null, current: string) {
  if (existing !== current) throw new ApiError(409, "Form sebelumnya sudah diterima. Mulai formulir baru untuk mengirim data berbeda.");
}
