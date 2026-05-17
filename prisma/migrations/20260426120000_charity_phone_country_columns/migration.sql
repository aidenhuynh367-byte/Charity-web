-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "phoneCountry" TEXT,
ADD COLUMN "phoneNationalNumber" TEXT,
ADD COLUMN "charityWhatsappCountry" TEXT,
ADD COLUMN "charityWhatsappNationalNumber" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "phone",
DROP COLUMN "charityWhatsapp";
