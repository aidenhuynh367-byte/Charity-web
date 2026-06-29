import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { Storage } from "@google-cloud/storage";

const RELATIVE_DIR = "uploads/donation-list-items";
/** Max size of a single uploaded file (matches server action body budget). */
const MAX_UPLOAD_BYTES = Math.floor(2.5 * 1024 * 1024);
/** Stored image must be at most this many bytes (client should compress first). */
const MAX_STORED_BYTES = 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const globalForStorage = globalThis as unknown as { gcs?: Storage };

function gcsBucketName(): string | null {
  const name =
    process.env.GCS_UPLOAD_BUCKET?.trim() ||
    process.env.STORAGE_BUCKET?.trim() ||
    "";
  return name || null;
}

function shouldUseCloudStorage(): boolean {
  return gcsBucketName() != null;
}

function getStorage(): Storage {
  if (!globalForStorage.gcs) {
    globalForStorage.gcs = new Storage();
  }
  return globalForStorage.gcs;
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
}

async function validateImageFile(file: File): Promise<Buffer> {
  if (!file || file.size === 0) {
    throw new Error("Empty image file.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Each image must be 2.5 MB or smaller.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Images must be JPEG, PNG, WebP, or GIF.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_STORED_BYTES) {
    throw new Error(
      "Each image must be 1 MB or smaller. Large images are resized in your browser before upload.",
    );
  }
  return buffer;
}

async function saveToLocalFilesystem(buffer: Buffer, mime: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", RELATIVE_DIR);
  await mkdir(dir, { recursive: true });

  const ext = extensionForMime(mime);
  const name = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), buffer);

  return `/${RELATIVE_DIR}/${name}`;
}

async function saveToCloudStorage(buffer: Buffer, mime: string): Promise<string> {
  const bucketName = gcsBucketName();
  if (!bucketName) {
    throw new Error("Cloud Storage bucket is not configured.");
  }

  const ext = extensionForMime(mime);
  const objectPath = `${RELATIVE_DIR}/${crypto.randomUUID()}${ext}`;
  const file = getStorage().bucket(bucketName).file(objectPath);

  await file.save(buffer, {
    contentType: mime,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  // Bucket uses uniform bucket-level access; public read is via bucket IAM, not object ACLs.
  try {
    await file.makePublic();
  } catch {
    // ignore when UBA is enabled
  }

  return `https://storage.googleapis.com/${bucketName}/${objectPath}`;
}

export async function saveDonationItemImage(file: File): Promise<string> {
  const buffer = await validateImageFile(file);
  if (shouldUseCloudStorage()) {
    return saveToCloudStorage(buffer, file.type);
  }
  return saveToLocalFilesystem(buffer, file.type);
}

async function removeLocalUploadFile(publicPath: string) {
  const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  try {
    await unlink(abs);
  } catch {
    // ignore missing file
  }
}

async function removeCloudStorageFile(publicUrl: string) {
  const bucketName = gcsBucketName();
  if (!bucketName) return;

  let parsed: URL;
  try {
    parsed = new URL(publicUrl);
  } catch {
    return;
  }

  if (parsed.hostname !== "storage.googleapis.com") return;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[0] !== bucketName) return;

  const objectPath = segments.slice(1).join("/");
  try {
    await getStorage().bucket(bucketName).file(objectPath).delete();
  } catch {
    // ignore missing object
  }
}

/** Remove a stored image given its public path (/uploads/...) or GCS URL. */
export async function removePublicUploadFile(publicPath: string | null | undefined) {
  if (!publicPath) return;

  if (publicPath.startsWith("/uploads/")) {
    await removeLocalUploadFile(publicPath);
    return;
  }

  if (publicPath.startsWith("https://storage.googleapis.com/")) {
    await removeCloudStorageFile(publicPath);
  }
}
