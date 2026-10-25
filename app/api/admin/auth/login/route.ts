import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { apiHandler, readJson } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { loginSchema } from "@/lib/auth/schema";
import { verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, clientIp, resetRateLimit } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const INVALID = "Username atau password salah.";

export const POST = apiHandler(async (request) => {
  assertSameOrigin(request);
  const { username, password } = loginSchema.parse(await readJson(request));

  const ip = clientIp(request);
  const userKey = `login:${ip}:${username.toLowerCase()}`;
  // Per username+IP for brute force, plus a looser per-IP bucket for spraying.
  for (const [key, limit] of [[userKey, 5], [`login-ip:${ip}`, 30]] as const) {
    const { allowed, retryAfterSec } = await checkRateLimit(key, limit, WINDOW_MS);
    if (!allowed) {
      throw new ApiError(429, "Terlalu banyak percobaan login. Coba lagi nanti.", undefined, {
        "Retry-After": String(retryAfterSec),
      });
    }
  }

  const admin = await prisma.admin.findUnique({
    where: { username },
    select: { id: true, passwordHash: true },
  });
  const ok = await verifyPassword(admin?.passwordHash ?? null, password);
  if (!admin || !ok) throw new ApiError(401, INVALID);

  await resetRateLimit(userKey);
  await createSession(admin.id);
  return NextResponse.json({ ok: true });
});
