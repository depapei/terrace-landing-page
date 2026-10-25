import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertValidKey, type ImageStorage } from "./types";

/**
 * Development storage on the local filesystem, outside `public/`. Files are
 * only ever served by app/media/[...key]/route.ts as image/webp, never executed.
 * Not persistent on serverless platforms such as Vercel.
 */
export class LocalImageStorage implements ImageStorage {
  private readonly root = process.env.LOCAL_STORAGE_DIR
    ? path.resolve(/*turbopackIgnore: true*/ process.env.LOCAL_STORAGE_DIR)
    : path.join(process.cwd(), "storage", "uploads");

  private resolve(key: string) {
    assertValidKey(key);
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Invalid storage key");
    return full;
  }

  async put(key: string, body: Buffer) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body, { flag: "wx" });
  }

  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }

  read(key: string) {
    return readFile(this.resolve(key));
  }

  url(key: string) {
    return `/media/${key}`;
  }
}
