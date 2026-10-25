import "server-only";

type Bucket = { count: number; resetAt: number };

// In-memory, per-process limiter. Adequate for a single Node instance; use a
// shared store (Redis/Upstash) when running multiple instances or serverless.
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return { allowed: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
