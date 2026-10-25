import { NextResponse } from "next/server";
import { createHeroSlide, listHeroSlides } from "@/features/hero/service";
import { heroSlideSchema } from "@/features/hero/schema";
import { ApiError } from "@/lib/api/errors";
import { apiHandler } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await listHeroSlides());
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  const { fields, image } = await readMultipart(request);
  const input = heroSlideSchema.parse(fields);
  if (!image) throw new ApiError(422, "Gambar wajib diunggah.", { image: ["Gambar wajib diunggah."] });
  return NextResponse.json(await createHeroSlide(input, image), { status: 201 });
});
