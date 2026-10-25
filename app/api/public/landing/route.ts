import { NextResponse } from "next/server";
import { getLandingData } from "@/lib/data/landing";

// Read-only public content for the landing page. Exposes active rows and
// public fields only; no admin data, no mutations.
export async function GET() {
  const { heroSlides, solutions, partners, achievements } = await getLandingData();
  return NextResponse.json({ heroSlides, solutions, partners, achievements });
}
