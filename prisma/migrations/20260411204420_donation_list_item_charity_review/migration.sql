-- CreateEnum
CREATE TYPE "DonationListItemReviewStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateEnum
CREATE TYPE "DonationListItemCharityDecision" AS ENUM ('ACCEPT', 'NOT_ACCEPT');

-- AlterTable
ALTER TABLE "DonationList" ADD COLUMN     "charityRespondedAt" TIMESTAMP(3),
ADD COLUMN     "charityResponseMessage" TEXT;

-- AlterTable
ALTER TABLE "DonationListItem" ADD COLUMN     "charityDecision" "DonationListItemCharityDecision",
ADD COLUMN     "reviewStatus" "DonationListItemReviewStatus" NOT NULL DEFAULT 'PENDING';
