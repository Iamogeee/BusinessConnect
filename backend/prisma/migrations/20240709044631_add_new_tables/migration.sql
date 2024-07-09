-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoriteCategories" TEXT[],
ADD COLUMN     "preferredRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Interaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "rated" DOUBLE PRECISION,
    "reviewed" TEXT,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_userId_businessId_key" ON "Interaction"("userId", "businessId");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
