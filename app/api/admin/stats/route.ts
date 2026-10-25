import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  const active = { where: { isActive: true } };
  const [hero, solutions, portfolio, partners, achievements] = await Promise.all([
    prisma.heroSlide.count(active),
    prisma.solutionPackage.count(active),
    prisma.portfolioItem.count(active),
    prisma.partner.count(active),
    prisma.achievementBadge.count(active),
  ]);
  return NextResponse.json({ hero, solutions, portfolio, partners, achievements });
});
