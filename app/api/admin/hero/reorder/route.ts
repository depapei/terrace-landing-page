import { NextResponse } from "next/server";
import { reorderHeroSlides } from "@/features/hero/service";
import { apiHandler, readJson } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";
import { reorderSchema } from "@/lib/validation/common";

export const PUT = apiHandler(async (request) => {
  await requireAdmin(request);
  const { ids } = reorderSchema.parse(await readJson(request));
  await reorderHeroSlides(ids);
  return new NextResponse(null, { status: 204 });
});
