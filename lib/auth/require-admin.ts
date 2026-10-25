import "server-only";
import { ApiError } from "@/lib/api/errors";
import { assertSameOrigin } from "./csrf";
import { getSessionAdmin } from "./session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Authorizes an admin API request. Every /api/admin handler calls this first. */
export async function requireAdmin(request: Request) {
  if (!SAFE_METHODS.has(request.method)) assertSameOrigin(request);
  const admin = await getSessionAdmin();
  if (!admin) throw new ApiError(401, "Sesi berakhir. Silakan login kembali.");
  return admin;
}
