import "server-only";
import { createHash } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { clientIp } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/prisma";

/** Bounded streaming read: Content-Length alone can be omitted or inaccurate. */
export async function readLeadJson(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ApiError(415, "Gunakan format JSON.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Body request wajib diisi.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 32_768) {
        await reader.cancel();
        throw new ApiError(413, "Data terlalu besar.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(body)) as unknown; }
  catch { throw new ApiError(400, "Body request harus berupa JSON yang valid."); }
}

export async function limitPublicLead(request: Request) {
  const key = createHash("sha256").update(`lead:${clientIp(request)}`).digest("hex");
  const now = new Date();
  const resetAt = new Date(now.getTime() + 15 * 60 * 1000);
  // Bounded retention: remove expired buckets as requests arrive.
  await prisma.leadSubmissionLimit.deleteMany({ where: { resetAt: { lt: now } } });
  const [bucket] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "LeadSubmissionLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "LeadSubmissionLimit"."resetAt" <= ${now} THEN 1 ELSE "LeadSubmissionLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "LeadSubmissionLimit"."resetAt" <= ${now} THEN EXCLUDED."resetAt" ELSE "LeadSubmissionLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  if (bucket.count > 10) {
    throw new ApiError(429, "Terlalu banyak pengiriman. Silakan coba lagi nanti.", undefined, {
      "Retry-After": String(Math.max(1, Math.ceil((new Date(bucket.resetAt).getTime() - now.getTime()) / 1000))),
    });
  }
}
