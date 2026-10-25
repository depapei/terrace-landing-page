import { NextResponse } from "next/server";
import { reorderPartners } from "@/features/partners/service";
import { apiHandler, readJson } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";
import { reorderSchema } from "@/lib/validation/common";

export const PUT = apiHandler(async (request) => {
  await requireAdmin(request);
  const { ids } = reorderSchema.parse(await readJson(request));
  await reorderPartners(ids);
  return new NextResponse(null, { status: 204 });
});
