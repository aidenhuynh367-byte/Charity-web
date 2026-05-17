-- CreateTable
CREATE TABLE "DonationListItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl1" TEXT,
    "imageUrl2" TEXT,
    "donationListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DonationListItem_donationListId_idx" ON "DonationListItem"("donationListId");

-- AddForeignKey
ALTER TABLE "DonationListItem" ADD CONSTRAINT "DonationListItem_donationListId_fkey" FOREIGN KEY ("donationListId") REFERENCES "DonationList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
