/*
  Warnings:

  - You are about to drop the column `businesId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `businessId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_businesId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "businesId",
ADD COLUMN     "businessId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
