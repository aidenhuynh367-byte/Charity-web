-- AlterTable
ALTER TABLE "DonationList" ADD COLUMN "charityId" TEXT;

-- CreateIndex
CREATE INDEX "DonationList_charityId_status_createdAt_idx" ON "DonationList"("charityId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "DonationList" ADD CONSTRAINT "DonationList_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
