import { NextResponse } from "next/server";
import { deleteSolution, setSolutionActive, updateSolution } from "@/features/solutions/service";
import { solutionSchema } from "@/features/solutions/schema";
import { apiHandler, parseId, readJson } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activeSchema } from "@/lib/validation/common";

type Ctx = RouteContext<"/api/admin/solutions/[id]">;

export const PUT = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  return NextResponse.json(await updateSolution(id, solutionSchema.parse(await readJson(request))));
});

export const PATCH = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { isActive } = activeSchema.parse(await readJson(request));
  return NextResponse.json(await setSolutionActive(id, isActive));
});

export const DELETE = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  await deleteSolution(await parseId(params));
  return new NextResponse(null, { status: 204 });
});
