-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Drop" ADD COLUMN     "artistInfo" TEXT,
ADD COLUMN     "externalLink" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "power" INTEGER;

-- CreateIndex
CREATE INDEX "Collection_creatorId_idx" ON "Collection"("creatorId");

-- CreateIndex
CREATE INDEX "Drop_collectionId_idx" ON "Drop"("collectionId");

-- CreateIndex
CREATE INDEX "MintedDrop_minterId_idx" ON "MintedDrop"("minterId");

-- CreateIndex
CREATE INDEX "MintedDrop_dropId_idx" ON "MintedDrop"("dropId");
