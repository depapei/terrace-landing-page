import "server-only";
import { prisma } from "@/lib/prisma";

// Fixed-window limiter stored in Postgres, so every serverless instance sees
// the same counts. One atomic upsert per check: a bucket whose window has
// passed restarts at 1.
export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  // Times come from the app (UTC), not now(): the column has no time zone.
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const [bucket] = await prisma.$queryRaw<{ count: number; resetAt: Date | string }[]>`
    INSERT INTO "LoginAttempt" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "LoginAttempt"."resetAt" <= ${now} THEN 1 ELSE "LoginAttempt"."count" + 1 END,
      "resetAt" = CASE WHEN "LoginAttempt"."resetAt" <= ${now} THEN EXCLUDED."resetAt" ELSE "LoginAttempt"."resetAt" END
    RETURNING "count", "resetAt"`;
  return {
    allowed: bucket.count <= limit,
    retryAfterSec: Math.max(0, Math.ceil((new Date(bucket.resetAt).getTime() - now.getTime()) / 1000)),
  };
}

/** Clears a bucket after a successful login, and sweeps expired ones. */
export async function resetRateLimit(key: string) {
  await prisma.loginAttempt.deleteMany({ where: { OR: [{ key }, { resetAt: { lt: new Date() } }] } });
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
