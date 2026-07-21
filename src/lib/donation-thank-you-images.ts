import { readdirSync } from "fs";
import path from "path";

/** Public URL paths under /DonationImages/... */
export function listDonationThankYouImages(): string[] {
  const dir = path.join(process.cwd(), "public", "DonationImages");
  try {
    return readdirSync(dir)
      .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))
      .map((name) => `/DonationImages/${name}`);
  } catch {
    return [];
  }
}

/** Stable pseudo-random pick so the same list keeps the same thank-you image. */
export function thankYouImageForList(
  listId: string,
  images: string[],
): string | null {
  if (images.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < listId.length; i++) {
    hash = (hash * 31 + listId.charCodeAt(i)) >>> 0;
  }
  return images[hash % images.length] ?? null;
}
