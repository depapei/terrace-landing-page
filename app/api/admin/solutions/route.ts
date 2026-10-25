import { NextResponse } from "next/server";
import { createSolution, listSolutions } from "@/features/solutions/service";
import { solutionSchema } from "@/features/solutions/schema";
import { apiHandler, readJson } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await listSolutions());
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  const input = solutionSchema.parse(await readJson(request));
  return NextResponse.json(await createSolution(input), { status: 201 });
});
