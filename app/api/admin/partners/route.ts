import { NextResponse } from "next/server";
import { createPartner, listPartners } from "@/features/partners/service";
import { partnerSchema } from "@/features/partners/schema";
import { ApiError } from "@/lib/api/errors";
import { apiHandler } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  await requireAdmin(request);
  return NextResponse.json(await listPartners());
});

export const POST = apiHandler(async (request) => {
  await requireAdmin(request);
  const { fields, image } = await readMultipart(request);
  const input = partnerSchema.parse(fields);
  if (!image) throw new ApiError(422, "Logo wajib diunggah.", { image: ["Logo wajib diunggah."] });
  return NextResponse.json(await createPartner(input, image), { status: 201 });
});
