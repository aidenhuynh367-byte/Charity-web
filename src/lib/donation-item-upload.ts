import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

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

export async function saveDonationItemImage(file: File): Promise<string> {
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

  const dir = path.join(process.cwd(), "public", RELATIVE_DIR);
  await mkdir(dir, { recursive: true });

  const ext = extensionForMime(file.type);
  const name = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), buffer);

  return `/${RELATIVE_DIR}/${name}`;
}

/** Remove a file stored under `public/` given its public URL path (e.g. `/uploads/...`). */
export async function removePublicUploadFile(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  try {
    await unlink(abs);
  } catch {
    // ignore missing file
  }
}
