import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

const active = { isActive: true } as const;
const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

async function queryLanding() {
  const [heroSlides, solutions, partners, achievements] = await Promise.all([
    prisma.heroSlide.findMany({
      where: active,
      orderBy: order,
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        imageWidth: true,
        imageHeight: true,
        altText: true,
      },
    }),
    prisma.solutionPackage.findMany({
      where: active,
      orderBy: order,
      select: {
        id: true,
        name: true,
        slug: true,
        label: true,
        badge: true,
        description: true,
        pricingType: true,
        pricingLabel: true,
        pricingNote: true,
        features: true,
        ctaLabel: true,
        ctaUrl: true,
        isFeatured: true,
      },
    }),
    prisma.partner.findMany({
      where: active,
      orderBy: order,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        logoWidth: true,
        logoHeight: true,
        websiteUrl: true,
        altText: true,
      },
    }),
    prisma.achievementBadge.findMany({
      where: active,
      orderBy: order,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        imageWidth: true,
        imageHeight: true,
        altText: true,
        issuer: true,
        credentialUrl: true,
      },
    }),
  ]);
  return { heroSlides, solutions, partners, achievements, available: true };
}

export type LandingData = Awaited<ReturnType<typeof queryLanding>>;
export type LandingHeroSlide = LandingData["heroSlides"][number];
export type LandingSolution = LandingData["solutions"][number];
export type LandingPartner = LandingData["partners"][number];
export type LandingAchievement = LandingData["achievements"][number];

const EMPTY: LandingData = {
  heroSlides: [],
  solutions: [],
  partners: [],
  achievements: [],
  available: false,
};

/**
 * Public landing content: active rows only, public fields only. Cached and
 * invalidated by tag whenever the CMS changes the corresponding entity.
 */
export async function getLandingData(): Promise<LandingData> {
  "use cache";
  cacheTag(cacheTags.hero, cacheTags.solutions, cacheTags.partners, cacheTags.achievements);
  try {
    const data = await queryLanding();
    cacheLife("hours");
    return data;
  } catch (error) {
    // Keep the page up (with empty states) if the database is unreachable,
    // and retry within minutes instead of caching the outage for hours.
    // ("seconds" would turn the whole page into a dynamic, uncached route.)
    console.error("[landing] failed to load content:", error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return EMPTY;
  }
}
