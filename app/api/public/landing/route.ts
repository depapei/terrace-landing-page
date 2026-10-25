import { NextResponse } from "next/server";
import { getLandingData } from "@/lib/data/landing";
import { getPublishedPortfolio } from "@/lib/data/portfolio";

// Read-only public content for the landing page. Exposes active/published rows
// and public fields only; no admin data, no mutations.
export async function GET() {
  const [{ heroSlides, solutions, partners, achievements }, { items: portfolio }] = await Promise.all([
    getLandingData(),
    getPublishedPortfolio(),
  ]);
  return NextResponse.json({ heroSlides, solutions, portfolio, partners, achievements });
}
