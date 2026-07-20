type CharityPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function CharityPhotoGrid({ images }: { images: CharityPhoto[] }) {
  if (images.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-600">No photos yet.</p>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img) => (
        <div
          key={img.id}
          className="overflow-hidden rounded-lg border border-slate-200 bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- user uploads from public/ or GCS */}
          <img
            src={img.imageUrl}
            alt={img.caption || "Photo"}
            className="h-48 w-full object-cover"
          />
          {img.caption ? (
            <p className="px-3 py-2 text-sm text-slate-800">{img.caption}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
