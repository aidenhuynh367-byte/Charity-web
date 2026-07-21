-- AlterEnum
ALTER TYPE "DonationListStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "DonationList" ADD COLUMN "completedAt" TIMESTAMP(3);
