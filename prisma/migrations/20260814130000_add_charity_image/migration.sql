-- CreateTable
CREATE TABLE "CharityImage" (
    "id" TEXT NOT NULL,
    "charityId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharityImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharityImage_charityId_createdAt_idx" ON "CharityImage"("charityId", "createdAt");

-- AddForeignKey
ALTER TABLE "CharityImage" ADD CONSTRAINT "CharityImage_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
