import "server-only";
import { ApiError } from "@/lib/api/errors";

export const CSRF_HEADER = "x-terrace-request";

/**
 * Cookie-authenticated mutations must come from this site: the browser-set
 * Origin header has to match the host, and the request must carry a custom
 * header (which cross-site forms cannot set without a CORS preflight).
 * Combined with SameSite=Strict cookies this blocks CSRF.
 */
export function assertSameOrigin(request: Request) {
  if (request.headers.get(CSRF_HEADER) !== "1") {
    throw new ApiError(403, "Permintaan ditolak.");
  }
  const origin = request.headers.get("origin");
  if (!origin) throw new ApiError(403, "Permintaan ditolak.");

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "Permintaan ditolak.");
  }

  const allowed = new Set<string>();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) allowed.add(host.split(",")[0].trim());
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    } catch {
      // ignore malformed config; the host header check still applies
    }
  }
  if (!allowed.has(originHost)) throw new ApiError(403, "Permintaan ditolak.");
}
