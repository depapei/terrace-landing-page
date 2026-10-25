import { NextResponse } from "next/server";
import {
  deletePortfolio,
  parseImageManifest,
  setPortfolioActive,
  updatePortfolio,
} from "@/features/portfolio/service";
import { MAX_PORTFOLIO_IMAGES, portfolioSchema } from "@/features/portfolio/schema";
import { apiHandler, parseId, readJson } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activeSchema } from "@/lib/validation/common";

type Ctx = RouteContext<"/api/admin/portfolio/[id]">;

export const PUT = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { fields, files } = await readMultipart(request, { maxFiles: MAX_PORTFOLIO_IMAGES });
  const input = portfolioSchema.parse(fields);
  const manifest = parseImageManifest(fields.images);
  return NextResponse.json(await updatePortfolio(id, input, manifest, files));
});

export const PATCH = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { isActive } = activeSchema.parse(await readJson(request));
  return NextResponse.json(await setPortfolioActive(id, isActive));
});

export const DELETE = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  await deletePortfolio(await parseId(params));
  return new NextResponse(null, { status: 204 });
});
