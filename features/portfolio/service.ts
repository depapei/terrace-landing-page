import "server-only";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { ApiError, notFound } from "@/lib/api/errors";
import { cacheTags } from "@/lib/cache-tags";
import { storeImages, withStoredImages, type StoredImage } from "@/lib/image/process";
import { prisma } from "@/lib/prisma";
import { deleteQuietly } from "@/lib/storage";
import { portfolioImagesSchema, type PortfolioImageManifest, type PortfolioInput } from "./schema";

const select = {
  id: true,
  title: true,
  slug: true,
  type: true,
  liveUrl: true,
  description: true,
  duration: true,
  sortOrder: true,
  isActive: true,
  updatedAt: true,
  images: {
    select: { id: true, imageUrl: true, imageWidth: true, imageHeight: true, altText: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.PortfolioItemSelect;

const refresh = () => revalidateTag(cacheTags.portfolio, { expire: 0 });

const fields = (input: PortfolioInput) => ({
  title: input.title,
  slug: input.slug,
  type: input.type,
  liveUrl: input.liveUrl,
  description: input.description,
  duration: input.duration,
  sortOrder: input.sortOrder,
  isActive: input.isActive,
});

const imagesError = (message: string) => new ApiError(422, message, { images: [message] });

/** Parses the JSON `images` manifest of a multipart request. */
export function parseImageManifest(raw: string | undefined): PortfolioImageManifest {
  let value: unknown;
  try {
    value = JSON.parse(raw ?? "");
  } catch {
    throw imagesError("Minimal 1 gambar proyek.");
  }
  const parsed = portfolioImagesSchema.safeParse(value);
  if (!parsed.success) throw imagesError(parsed.error.issues[0]?.message ?? "Gambar tidak valid.");
  return parsed.data;
}

/** Stores the files referenced by the manifest, in manifest order. */
async function storeUploads(manifest: PortfolioImageManifest, files: Map<string, File>) {
  const uploads = manifest.flatMap((entry, index) => {
    if (!entry.upload) return [];
    const file = files.get(entry.upload);
    if (!file) throw imagesError(`Gambar ${index + 1} belum diunggah.`);
    return [{ field: entry.upload, file }];
  });
  const stored = await storeImages(
    uploads.map((u) => u.file),
    "portfolio",
  );
  return { stored, byField: new Map(uploads.map((u, i) => [u.field, stored[i]])) };
}

const imageData = (image: StoredImage, altText: string, sortOrder: number) => ({
  imageUrl: image.url,
  imageKey: image.key,
  imageWidth: image.width,
  imageHeight: image.height,
  altText,
  sortOrder,
});

export function listPortfolio() {
  return prisma.portfolioItem.findMany({
    select,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createPortfolio(
  input: PortfolioInput,
  manifest: PortfolioImageManifest,
  files: Map<string, File>,
) {
  if (manifest.some((entry) => entry.id)) throw imagesError("Gambar tidak valid.");
  const { stored, byField } = await storeUploads(manifest, files);
  const item = await withStoredImages(stored, () =>
    prisma.portfolioItem.create({
      select,
      data: {
        ...fields(input),
        images: {
          create: manifest.map((entry, index) =>
            imageData(byField.get(entry.upload!)!, entry.altText, index),
          ),
        },
      },
    }),
  );
  refresh();
  return item;
}

/**
 * Applies the manifest: kept images are re-ordered and re-labelled, missing
 * ones removed, new uploads added, all in one write. Files of removed images
 * are deleted only after that write succeeds.
 */
export async function updatePortfolio(
  id: string,
  input: PortfolioInput,
  manifest: PortfolioImageManifest,
  files: Map<string, File>,
) {
  const existing = await prisma.portfolioItem.findUnique({
    where: { id },
    select: { images: { select: { id: true, imageKey: true } } },
  });
  if (!existing) throw notFound("Hasil kerja");

  const owned = new Set(existing.images.map((image) => image.id));
  if (manifest.some((entry) => entry.id && !owned.has(entry.id))) throw imagesError("Gambar tidak valid.");
  const keptIds = manifest.flatMap((entry) => (entry.id ? [entry.id] : []));
  const removedKeys = existing.images.filter((image) => !keptIds.includes(image.id)).map((i) => i.imageKey);

  const { stored, byField } = await storeUploads(manifest, files);
  const item = await withStoredImages(
    stored,
    () =>
      prisma.portfolioItem.update({
        where: { id },
        select,
        data: {
          ...fields(input),
          images: {
            deleteMany: { id: { notIn: keptIds } },
            update: manifest.flatMap((entry, index) =>
              entry.id ? [{ where: { id: entry.id }, data: { altText: entry.altText, sortOrder: index } }] : [],
            ),
            create: manifest.flatMap((entry, index) =>
              entry.upload ? [imageData(byField.get(entry.upload)!, entry.altText, index)] : [],
            ),
          },
        },
      }),
    removedKeys,
  );
  refresh();
  return item;
}

export async function setPortfolioActive(id: string, isActive: boolean) {
  const item = await prisma.portfolioItem.update({ where: { id }, data: { isActive }, select });
  refresh();
  return item;
}

export async function deletePortfolio(id: string) {
  // Image rows cascade with the item; their files are removed afterwards.
  const item = await prisma.portfolioItem.delete({
    where: { id },
    select: { images: { select: { imageKey: true } } },
  });
  await Promise.all(item.images.map((image) => deleteQuietly(image.imageKey)));
  refresh();
}

export async function reorderPortfolio(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.portfolioItem.update({ where: { id }, data: { sortOrder: index } })),
  );
  refresh();
}
