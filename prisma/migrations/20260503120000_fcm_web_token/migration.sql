-- CreateTable
CREATE TABLE "FcmWebToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FcmWebToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FcmWebToken_token_key" ON "FcmWebToken"("token");

-- CreateIndex
CREATE INDEX "FcmWebToken_userId_idx" ON "FcmWebToken"("userId");

-- AddForeignKey
ALTER TABLE "FcmWebToken" ADD CONSTRAINT "FcmWebToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
