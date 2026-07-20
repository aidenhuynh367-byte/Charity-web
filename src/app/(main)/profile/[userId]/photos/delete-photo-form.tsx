"use client";

import { deleteCharityImage } from "@/app/actions/charity-images";

export function DeletePhotoForm({ id }: { id: string }) {
  return (
    <form
      action={deleteCharityImage}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Are you sure you want to delete this photo? This cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
