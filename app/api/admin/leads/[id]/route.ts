import { NextResponse } from "next/server";
import { leadProgressSchema, potentialLeadUpdateSchema } from "@/features/leads/schema";
import { deletePotentialLead, getLead, updateLeadProgress, updatePotentialLead } from "@/features/leads/service";
import { readLeadJson } from "@/features/leads/public-security";
import { apiHandler, parseId } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";

type Ctx = RouteContext<"/api/admin/leads/[id]">;

export const GET = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  return NextResponse.json(await getLead(await parseId(params)), { headers: { "Cache-Control": "private, no-store" } });
});
export const PUT = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  return NextResponse.json(await updatePotentialLead(id, potentialLeadUpdateSchema.parse(await readLeadJson(request))));
});
export const PATCH = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  return NextResponse.json(await updateLeadProgress(id, leadProgressSchema.parse(await readLeadJson(request))));
});
export const DELETE = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  await deletePotentialLead(await parseId(params));
  return new NextResponse(null, { status: 204 });
});
