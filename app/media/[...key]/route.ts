import { getLocalStorage } from "@/lib/storage";
import { STORAGE_KEY_PATTERN } from "@/lib/storage/types";

// Serves WebP files written by the local storage driver. Keys must match the
// generated-name pattern, so path traversal and arbitrary file reads are impossible.
export async function GET(_request: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key: segments } = await ctx.params;
  const key = segments.join("/");
  if (process.env.STORAGE_DRIVER === "s3" || !STORAGE_KEY_PATTERN.test(key)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const body = await getLocalStorage().read(key);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
