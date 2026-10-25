import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { destroySession } from "@/lib/auth/session";

export const POST = apiHandler(async (request) => {
  assertSameOrigin(request);
  await destroySession();
  return NextResponse.json({ ok: true });
});
