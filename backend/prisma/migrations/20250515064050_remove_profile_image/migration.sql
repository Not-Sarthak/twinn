/*
  Warnings:

  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Drop" ADD COLUMN     "metadataUri" TEXT,
ADD COLUMN     "mintAddress" TEXT,
ADD COLUMN     "uniqueCode" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileImage";
