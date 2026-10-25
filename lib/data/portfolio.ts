import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

// Public portfolio reads: published rows only, public fields only. Cached and
// invalidated by the portfolio tag whenever the CMS changes an item.

const published = { isActive: true } as const;
const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];
const imageSelect = { id: true, imageUrl: true, imageWidth: true, imageHeight: true, altText: true } as const;

function logFailure(what: string, error: unknown) {
  console.error(`[portfolio] failed to load ${what}:`, error instanceof Error ? error.message : error);
}

async function queryPortfolioList() {
  const rows = await prisma.portfolioItem.findMany({
    where: published,
    orderBy: order,
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      description: true,
      duration: true,
      // The first image is the card thumbnail.
      images: { select: imageSelect, orderBy: order, take: 1 },
    },
  });
  return rows.flatMap(({ images, ...item }) => (images[0] ? [{ ...item, thumbnail: images[0] }] : []));
}

export type PortfolioCardData = Awaited<ReturnType<typeof queryPortfolioList>>[number];

/** Published items for the landing page; `available: false` means the database could not be read. */
export async function getPublishedPortfolio(): Promise<{ items: PortfolioCardData[]; available: boolean }> {
  "use cache";
  cacheTag(cacheTags.portfolio);
  try {
    const items = await queryPortfolioList();
    cacheLife("hours");
    return { items, available: true };
  } catch (error) {
    // Retry within minutes instead of caching the outage for hours.
    logFailure("list", error);
    cacheLife("minutes");
    return { items: [], available: false };
  }
}

async function queryPortfolioBySlug(slug: string) {
  return prisma.portfolioItem.findFirst({
    where: { ...published, slug },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      liveUrl: true,
      description: true,
      duration: true,
      images: { select: imageSelect, orderBy: order },
    },
  });
}

export type PortfolioDetailData = NonNullable<Awaited<ReturnType<typeof queryPortfolioBySlug>>>;

export type PortfolioDetailResult =
  | { status: "ok"; item: PortfolioDetailData }
  | { status: "not-found" }
  | { status: "error" };

/** One published item by slug. Unpublished or unknown slugs are "not-found". */
export async function getPublishedPortfolioBySlug(slug: string): Promise<PortfolioDetailResult> {
  "use cache";
  cacheTag(cacheTags.portfolio);
  try {
    const item = await queryPortfolioBySlug(slug);
    cacheLife("hours");
    return item ? { status: "ok", item } : { status: "not-found" };
  } catch (error) {
    logFailure(`"${slug}"`, error);
    cacheLife("minutes");
    return { status: "error" };
  }
}

/** Slugs of published items, for prerendering detail pages at build time. */
export async function getPublishedPortfolioSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(cacheTags.portfolio);
  try {
    const rows = await prisma.portfolioItem.findMany({ where: published, orderBy: order, select: { slug: true } });
    cacheLife("hours");
    return rows.map((row) => row.slug);
  } catch (error) {
    logFailure("slugs", error);
    cacheLife("minutes");
    return [];
  }
}
