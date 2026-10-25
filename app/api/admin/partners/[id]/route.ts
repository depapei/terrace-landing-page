import { NextResponse } from "next/server";
import { deletePartner, setPartnerActive, updatePartner } from "@/features/partners/service";
import { partnerSchema } from "@/features/partners/schema";
import { apiHandler, parseId, readJson } from "@/lib/api/handler";
import { readMultipart } from "@/lib/api/multipart";
import { requireAdmin } from "@/lib/auth/require-admin";
import { activeSchema } from "@/lib/validation/common";

type Ctx = RouteContext<"/api/admin/partners/[id]">;

export const PUT = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { fields, image } = await readMultipart(request);
  return NextResponse.json(await updatePartner(id, partnerSchema.parse(fields), image));
});

export const PATCH = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  const id = await parseId(params);
  const { isActive } = activeSchema.parse(await readJson(request));
  return NextResponse.json(await setPartnerActive(id, isActive));
});

export const DELETE = apiHandler<Ctx>(async (request, { params }) => {
  await requireAdmin(request);
  await deletePartner(await parseId(params));
  return new NextResponse(null, { status: 204 });
});
