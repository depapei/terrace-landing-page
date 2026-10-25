import "server-only";
import { revalidateTag } from "next/cache";
import { notFound } from "@/lib/api/errors";
import { cacheTags } from "@/lib/cache-tags";
import { storeImage, withStoredImage } from "@/lib/image/process";
import { prisma } from "@/lib/prisma";
import { deleteQuietly } from "@/lib/storage";
import type { AchievementInput } from "./schema";

const select = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  imageWidth: true,
  imageHeight: true,
  altText: true,
  issuer: true,
  credentialUrl: true,
  sortOrder: true,
  isActive: true,
  updatedAt: true,
} as const;

const refresh = () => revalidateTag(cacheTags.achievements, { expire: 0 });

const fields = (input: AchievementInput) => ({
  name: input.name,
  description: input.description,
  issuer: input.issuer,
  credentialUrl: input.credentialUrl,
  altText: input.altText,
  sortOrder: input.sortOrder,
  isActive: input.isActive,
});

export function listAchievements() {
  return prisma.achievementBadge.findMany({
    select,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createAchievement(input: AchievementInput, file: File) {
  const image = await storeImage(file, "achievements");
  const badge = await withStoredImage(image, () =>
    prisma.achievementBadge.create({
      select,
      data: {
        ...fields(input),
        imageUrl: image.url,
        imageKey: image.key,
        imageWidth: image.width,
        imageHeight: image.height,
      },
    }),
  );
  refresh();
  return badge;
}

export async function updateAchievement(id: string, input: AchievementInput, file: File | null) {
  const existing = await prisma.achievementBadge.findUnique({
    where: { id },
    select: { imageKey: true },
  });
  if (!existing) throw notFound("Achievement");

  const image = file ? await storeImage(file, "achievements") : null;
  const badge = await withStoredImage(
    image,
    () =>
      prisma.achievementBadge.update({
        where: { id },
        select,
        data: {
          ...fields(input),
          ...(image && {
            imageUrl: image.url,
            imageKey: image.key,
            imageWidth: image.width,
            imageHeight: image.height,
          }),
        },
      }),
    existing.imageKey,
  );
  refresh();
  return badge;
}

export async function setAchievementActive(id: string, isActive: boolean) {
  const badge = await prisma.achievementBadge.update({ where: { id }, data: { isActive }, select });
  refresh();
  return badge;
}

export async function deleteAchievement(id: string) {
  const badge = await prisma.achievementBadge.delete({ where: { id }, select: { imageKey: true } });
  await deleteQuietly(badge.imageKey);
  refresh();
}

export async function reorderAchievements(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.achievementBadge.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  refresh();
}
