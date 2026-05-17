-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "contributorWhatsappCountry" TEXT,
ADD COLUMN "contributorWhatsappNationalNumber" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "contributorWhatsapp";
