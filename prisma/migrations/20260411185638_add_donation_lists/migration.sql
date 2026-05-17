-- CreateEnum
CREATE TYPE "DonationListStatus" AS ENUM ('NOT_SUBMITTED');

-- CreateTable
CREATE TABLE "DonationList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DonationListStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributorId" TEXT NOT NULL,

    CONSTRAINT "DonationList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DonationList_contributorId_createdAt_idx" ON "DonationList"("contributorId", "createdAt");

-- AddForeignKey
ALTER TABLE "DonationList" ADD CONSTRAINT "DonationList_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
