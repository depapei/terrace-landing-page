export const IMAGE_FOLDERS = ["hero", "partners", "achievements"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

/** Storage keys are always generated server-side: `<folder>/<uuid>.webp`. */
export const STORAGE_KEY_PATTERN =
  /^(hero|partners|achievements)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

export interface ImageStorage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Public URL the website uses to display the asset. */
  url(key: string): string;
}

export function assertValidKey(key: string) {
  if (!STORAGE_KEY_PATTERN.test(key)) throw new Error("Invalid storage key");
}
