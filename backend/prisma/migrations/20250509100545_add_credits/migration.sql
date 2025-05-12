/*
  Warnings:

  - You are about to drop the column `collectionId` on the `Moment` table. All the data in the column will be lost.
  - Made the column `dropId` on table `Moment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mintedDropId` on table `Moment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Moment" DROP CONSTRAINT "Moment_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Moment" DROP CONSTRAINT "Moment_dropId_fkey";

-- DropForeignKey
ALTER TABLE "Moment" DROP CONSTRAINT "Moment_mintedDropId_fkey";

-- AlterTable
ALTER TABLE "Drop" ADD COLUMN     "creditsAllocated" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Moment" DROP COLUMN "collectionId",
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "locationTaken" TEXT,
ALTER COLUMN "dropId" SET NOT NULL,
ALTER COLUMN "mintedDropId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionHash" TEXT,
    "cost" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "dropId" TEXT,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Drop_creatorId_idx" ON "Drop"("creatorId");

-- CreateIndex
CREATE INDEX "Moment_creatorId_idx" ON "Moment"("creatorId");

-- CreateIndex
CREATE INDEX "Moment_dropId_idx" ON "Moment"("dropId");

-- CreateIndex
CREATE INDEX "Moment_mintedDropId_idx" ON "Moment"("mintedDropId");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moment" ADD CONSTRAINT "Moment_mintedDropId_fkey" FOREIGN KEY ("mintedDropId") REFERENCES "MintedDrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moment" ADD CONSTRAINT "Moment_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
