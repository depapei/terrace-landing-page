import { NextResponse } from "next/server";
import { createAchievement, listAchievements } from "@/features/achievements/service";
import { achievementSchema } from "@/features/achievements/schema";
import { ApiError } from "@/lib/api/errors";
import { apiHandler } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await listAchievements());
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  const { fields, image } = await readMultipart(request);
  const input = achievementSchema.parse(fields);
  if (!image) throw new ApiError(422, "Gambar badge wajib diunggah.", { image: ["Gambar badge wajib diunggah."] });
  return NextResponse.json(await createAchievement(input, image), { status: 201 });
});
