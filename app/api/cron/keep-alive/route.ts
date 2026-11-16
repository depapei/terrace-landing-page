import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Called daily by Vercel Cron (see vercel.json) so the Supabase project keeps
 * seeing database activity and is not paused for inactivity.
 *
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env
 * var is set; any other caller gets 401.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // A real table read, not just `SELECT 1`, so it registers as project activity.
    const heroSlides = await prisma.heroSlide.count();
    return NextResponse.json(
      { ok: true, heroSlides, at: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[cron/keep-alive] database ping failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
