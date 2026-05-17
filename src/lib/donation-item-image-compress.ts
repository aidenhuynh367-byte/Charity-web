/** Max stored / per-image size after client compression (bytes). */
export const DONATION_ITEM_IMAGE_MAX_BYTES = 1024 * 1024;

function baseFileName(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name || "image";
}

/**
 * If `file` is larger than 1 MB, re-encode as JPEG via canvas until size <= 1 MB.
 * Otherwise returns the original `file`.
 */
export async function compressDonationImageIfNeeded(file: File): Promise<File> {
  if (file.size <= DONATION_ITEM_IMAGE_MAX_BYTES) return file;

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not prepare image for compression.");
    }

    let scale = Math.min(
      1,
      2048 / Math.max(bitmap.width, bitmap.height),
    );

    for (let round = 0; round < 28; round++) {
      const w = Math.max(1, Math.floor(bitmap.width * scale));
      const h = Math.max(1, Math.floor(bitmap.height * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(bitmap, 0, 0, w, h);

      for (let q = 0.92; q >= 0.18; q -= 0.06) {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/jpeg", q);
        });
        if (blob && blob.size <= DONATION_ITEM_IMAGE_MAX_BYTES) {
          const outName = `${baseFileName(file.name)}.jpg`;
          return new File([blob], outName, { type: "image/jpeg" });
        }
      }

      scale *= 0.86;
      if (bitmap.width * scale < 32 || bitmap.height * scale < 32) {
        break;
      }
    }

    throw new Error("Could not reduce image to 1 MB or smaller in the browser.");
  } finally {
    bitmap.close();
  }
}
