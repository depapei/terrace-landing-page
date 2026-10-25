import "server-only";
import { revalidateTag } from "next/cache";
import { notFound } from "@/lib/api/errors";
import { cacheTags } from "@/lib/cache-tags";
import { storeImage, withStoredImage } from "@/lib/image/process";
import { prisma } from "@/lib/prisma";
import { deleteQuietly } from "@/lib/storage";
import type { HeroSlideInput } from "./schema";

const select = {
  id: true,
  title: true,
  subtitle: true,
  imageUrl: true,
  imageWidth: true,
  imageHeight: true,
  altText: true,
  sortOrder: true,
  isActive: true,
  updatedAt: true,
} as const;

const refresh = () => revalidateTag(cacheTags.hero, { expire: 0 });

export function listHeroSlides() {
  return prisma.heroSlide.findMany({ select, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createHeroSlide(input: HeroSlideInput, file: File) {
  const image = await storeImage(file, "hero");
  const slide = await withStoredImage(image, () =>
    prisma.heroSlide.create({
      select,
      data: {
        title: input.title,
        subtitle: input.subtitle,
        altText: input.altText,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        imageUrl: image.url,
        imageKey: image.key,
        imageWidth: image.width,
        imageHeight: image.height,
      },
    }),
  );
  refresh();
  return slide;
}

export async function updateHeroSlide(id: string, input: HeroSlideInput, file: File | null) {
  const existing = await prisma.heroSlide.findUnique({ where: { id }, select: { imageKey: true } });
  if (!existing) throw notFound("Slide");

  const image = file ? await storeImage(file, "hero") : null;
  const slide = await withStoredImage(
    image,
    () =>
      prisma.heroSlide.update({
        where: { id },
        select,
        data: {
          title: input.title,
          subtitle: input.subtitle,
          altText: input.altText,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
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
  return slide;
}

export async function setHeroSlideActive(id: string, isActive: boolean) {
  const slide = await prisma.heroSlide.update({ where: { id }, data: { isActive }, select });
  refresh();
  return slide;
}

export async function deleteHeroSlide(id: string) {
  const slide = await prisma.heroSlide.delete({ where: { id }, select: { imageKey: true } });
  await deleteQuietly(slide.imageKey);
  refresh();
}

export async function reorderHeroSlides(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.heroSlide.update({ where: { id }, data: { sortOrder: index } })),
  );
  refresh();
}
