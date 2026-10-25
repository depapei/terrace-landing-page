import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { assertValidKey, type ImageStorage } from "./types";

/**
 * S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, ...).
 * Configure with S3_* environment variables; see README "Image storage".
 */
export class S3ImageStorage implements ImageStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
    if (!bucket || !publicBaseUrl) {
      throw new Error("S3 storage requires S3_BUCKET and S3_PUBLIC_BASE_URL");
    }
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.replace(/\/+$/, "");
    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  async put(key: string, body: Buffer, contentType: string) {
    assertValidKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  async delete(key: string) {
    assertValidKey(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  url(key: string) {
    return `${this.publicBaseUrl}/${key}`;
  }
}
