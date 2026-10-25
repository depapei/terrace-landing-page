import { NextResponse } from "next/server";
import {
  deleteAchievement,
  setAchievementActive,
  updateAchievement,
} from "@/features/achievements/service";
import { achievementSchema } from "@/features/achievements/schema";
import { apiHandler, parseId, readJson } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activeSchema } from "@/lib/validation/common";

type Ctx = RouteContext<"/api/admin/achievements/[id]">;

export const PUT = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { fields, image } = await readMultipart(request);
  return NextResponse.json(await updateAchievement(id, achievementSchema.parse(fields), image));
});

export const PATCH = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { isActive } = activeSchema.parse(await readJson(request));
  return NextResponse.json(await setAchievementActive(id, isActive));
});

export const DELETE = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  await deleteAchievement(await parseId(params));
  return new NextResponse(null, { status: 204 });
});
