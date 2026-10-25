import { NextResponse } from "next/server";
import { createPortfolio, listPortfolio, parseImageManifest } from "@/features/portfolio/service";
import { MAX_PORTFOLIO_IMAGES, portfolioSchema } from "@/features/portfolio/schema";
import { apiHandler } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await listPortfolio());
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  const { fields, files } = await readMultipart(request, { maxFiles: MAX_PORTFOLIO_IMAGES });
  const input = portfolioSchema.parse(fields);
  const manifest = parseImageManifest(fields.images);
  return NextResponse.json(await createPortfolio(input, manifest, files), { status: 201 });
});
