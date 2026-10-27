import { NextResponse } from "next/server";
import { leadListSchema, potentialLeadSchema } from "@/features/leads/schema";
import { createPotentialLead, listLeads } from "@/features/leads/service";
import { readLeadJson } from "@/features/leads/public-security";
import { apiHandler } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  const query = leadListSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  return NextResponse.json(await listLeads(query), { headers: { "Cache-Control": "private, no-store" } });
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await createPotentialLead(potentialLeadSchema.parse(await readLeadJson(request))), { status: 201 });
});
