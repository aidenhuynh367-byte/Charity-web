import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { AddPhotoModal } from "./add-photo-modal";
import { DeletePhotoForm } from "./delete-photo-form";

type Props = { params: Promise<{ userId: string }> };

export default async function CharityPhotosPage({ params }: Props) {
  const { userId: targetUserId } = await params;
  const viewerId = await requireUserId();
  const viewerProfile = await getOrCreateProfile(viewerId);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });
  if (
    !target?.profile ||
    target.profile.role !== Role.CHARITY_ORGANIZATION
  ) {
    notFound();
  }

  const canManage =
    viewerProfile.role === Role.CHARITY_ORGANIZATION &&
    viewerId === targetUserId;

  // Contributors may view; only the charity can manage their own photos.
  if (
    viewerProfile.role !== Role.CHARITY_ORGANIZATION &&
    viewerProfile.role !== Role.CONTRIBUTOR
  ) {
    redirect("/dashboard");
  }

  const images = await prisma.charityImage.findMany({
    where: { charityId: targetUserId },
    orderBy: { createdAt: "desc" },
  });

  const charityName =
    target.profile.organizationName?.trim() ||
    target.name?.trim() ||
    "Charity";

  const backHref =
    viewerId === targetUserId ? "/profile" : `/profile/${targetUserId}`;

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {charityName} photos
          </h1>
        </div>
        {canManage ? <AddPhotoModal /> : null}
      </div>

      {images.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">No photos yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="flex items-start justify-between gap-2 px-3 py-2">
                <p className="min-w-0 flex-1 text-sm text-slate-800">
                  {img.caption}
                </p>
                {canManage ? <DeletePhotoForm id={img.id} /> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
