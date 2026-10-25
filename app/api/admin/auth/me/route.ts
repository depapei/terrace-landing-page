import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/auth/require-admin";

export const GET = apiHandler(async (request) => {
  const admin = await requireAdmin(request);
  return NextResponse.json({ username: admin.username });
});
