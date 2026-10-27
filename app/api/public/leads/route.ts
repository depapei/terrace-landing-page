import { NextResponse } from "next/server";
import { publicLeadSchema } from "@/features/leads/schema";
import { submitPublicLead } from "@/features/leads/service";
import { limitPublicLead, readLeadJson } from "@/features/leads/public-security";
import { apiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/auth/csrf";

// No public GET/list/detail endpoint. Public callers cannot choose status/source.
export const POST = apiHandler(async (request) => {
  assertSameOrigin(request);
  await limitPublicLead(request);
  const input = publicLeadSchema.parse(await readLeadJson(request));
  return NextResponse.json(await submitPublicLead(input), { status: 201, headers: { "Cache-Control": "no-store" } });
});
