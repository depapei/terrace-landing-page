import { NextResponse, type NextRequest } from "next/server";

// Must match SESSION_COOKIE in lib/auth/session.ts (that module is server-only).
const SESSION_COOKIE = "terrace_admin";

/**
 * Optimistic check only: bounce visitors without a session cookie away from
 * admin pages. Real authorization happens on the server for every page and
 * API request (see lib/auth/require-admin.ts and lib/auth/current-admin.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
