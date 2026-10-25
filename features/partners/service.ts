import "server-only";
import { revalidateTag } from "next/cache";
import { notFound } from "@/lib/api/errors";
import { cacheTags } from "@/lib/cache-tags";
import { storeImage, withStoredImage } from "@/lib/image/process";
import { prisma } from "@/lib/prisma";
import { deleteQuietly } from "@/lib/storage";
import type { PartnerInput } from "./schema";

const select = {
  id: true,
  name: true,
  logoUrl: true,
  logoWidth: true,
  logoHeight: true,
  websiteUrl: true,
  altText: true,
  sortOrder: true,
  isActive: true,
  updatedAt: true,
} as const;

const refresh = () => revalidateTag(cacheTags.partners, { expire: 0 });

const fields = (input: PartnerInput) => ({
  name: input.name,
  websiteUrl: input.websiteUrl,
  altText: input.altText,
  sortOrder: input.sortOrder,
  isActive: input.isActive,
});

export function listPartners() {
  return prisma.partner.findMany({ select, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createPartner(input: PartnerInput, file: File) {
  const logo = await storeImage(file, "partners");
  const partner = await withStoredImage(logo, () =>
    prisma.partner.create({
      select,
      data: {
        ...fields(input),
        logoUrl: logo.url,
        logoKey: logo.key,
        logoWidth: logo.width,
        logoHeight: logo.height,
      },
    }),
  );
  refresh();
  return partner;
}

export async function updatePartner(id: string, input: PartnerInput, file: File | null) {
  const existing = await prisma.partner.findUnique({ where: { id }, select: { logoKey: true } });
  if (!existing) throw notFound("Mitra");

  const logo = file ? await storeImage(file, "partners") : null;
  const partner = await withStoredImage(
    logo,
    () =>
      prisma.partner.update({
        where: { id },
        select,
        data: {
          ...fields(input),
          ...(logo && {
            logoUrl: logo.url,
            logoKey: logo.key,
            logoWidth: logo.width,
            logoHeight: logo.height,
          }),
        },
      }),
    existing.logoKey,
  );
  refresh();
  return partner;
}

export async function setPartnerActive(id: string, isActive: boolean) {
  const partner = await prisma.partner.update({ where: { id }, data: { isActive }, select });
  refresh();
  return partner;
}

export async function deletePartner(id: string) {
  const partner = await prisma.partner.delete({ where: { id }, select: { logoKey: true } });
  await deleteQuietly(partner.logoKey);
  refresh();
}

export async function reorderPartners(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.partner.update({ where: { id }, data: { sortOrder: index } })),
  );
  refresh();
}
