import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "terrace_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type SessionAdmin = { id: string; username: string };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a DB-backed session and sets the HttpOnly cookie. Route Handlers only. */
export async function createSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.adminSession.create({
    data: { tokenHash: hashToken(token), adminId, expiresAt },
  });
  // Opportunistic cleanup keeps the table small without a cron job.
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/** Resolves the admin for the current request's session cookie, or null. */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, expiresAt: true, admin: { select: { id: true, username: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.admin;
}

/** Deletes the session row and clears the cookie. Route Handlers only. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}
