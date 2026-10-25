import "server-only";
import { randomUUID } from "node:crypto";
import { LocalImageStorage } from "./local";
import { S3ImageStorage } from "./s3";
import type { ImageFolder, ImageStorage } from "./types";

let instance: ImageStorage | null = null;
let local: LocalImageStorage | null = null;

/** Selected by STORAGE_DRIVER (`local` default, or `s3`). */
export function getStorage(): ImageStorage {
  if (!instance) {
    instance = process.env.STORAGE_DRIVER === "s3" ? new S3ImageStorage() : getLocalStorage();
  }
  return instance;
}

export function getLocalStorage() {
  local ??= new LocalImageStorage();
  return local;
}

export function newImageKey(folder: ImageFolder) {
  return `${folder}/${randomUUID()}.webp`;
}

/** Best-effort deletion used for cleanup; failures are logged, not thrown. */
export async function deleteQuietly(key: string | null | undefined) {
  if (!key) return;
  try {
    await getStorage().delete(key);
  } catch (error) {
    console.error("[storage] failed to delete", key, error);
  }
}

export type { ImageFolder, ImageStorage };
