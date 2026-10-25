import "server-only";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { cacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import type { SolutionInput } from "./schema";

const select = {
  id: true,
  name: true,
  slug: true,
  label: true,
  badge: true,
  description: true,
  pricingType: true,
  priceMin: true,
  priceMax: true,
  pricingLabel: true,
  pricingNote: true,
  features: true,
  ctaLabel: true,
  ctaUrl: true,
  isFeatured: true,
  sortOrder: true,
  isActive: true,
  updatedAt: true,
} as const;

type Row = Prisma.SolutionPackageGetPayload<{ select: typeof select }>;

// Prisma returns Decimal objects; the API and UI work with plain numbers.
function toDto(row: Row) {
  return {
    ...row,
    priceMin: row.priceMin === null ? null : row.priceMin.toNumber(),
    priceMax: row.priceMax === null ? null : row.priceMax.toNumber(),
  };
}

const refresh = () => revalidateTag(cacheTags.solutions, { expire: 0 });

const fields = (input: SolutionInput) => ({
  name: input.name,
  slug: input.slug,
  label: input.label,
  badge: input.badge,
  description: input.description,
  pricingType: input.pricingType,
  priceMin: input.priceMin,
  priceMax: input.priceMax,
  pricingLabel: input.pricingLabel,
  pricingNote: input.pricingNote,
  features: input.features,
  ctaLabel: input.ctaLabel,
  ctaUrl: input.ctaUrl,
  isFeatured: input.isFeatured,
  sortOrder: input.sortOrder,
  isActive: input.isActive,
});

export async function listSolutions() {
  const rows = await prisma.solutionPackage.findMany({
    select,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDto);
}

export async function createSolution(input: SolutionInput) {
  const row = await prisma.solutionPackage.create({ data: fields(input), select });
  refresh();
  return toDto(row);
}

export async function updateSolution(id: string, input: SolutionInput) {
  const row = await prisma.solutionPackage.update({ where: { id }, data: fields(input), select });
  refresh();
  return toDto(row);
}

export async function setSolutionActive(id: string, isActive: boolean) {
  const row = await prisma.solutionPackage.update({ where: { id }, data: { isActive }, select });
  refresh();
  return toDto(row);
}

export async function deleteSolution(id: string) {
  await prisma.solutionPackage.delete({ where: { id } });
  refresh();
}

export async function reorderSolutions(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.solutionPackage.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  refresh();
}
