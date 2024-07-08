/*
  Warnings:

  - You are about to drop the column `businessId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `businesId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_businessId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "businessId",
DROP COLUMN "userId",
ADD COLUMN     "businesId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businesId_fkey" FOREIGN KEY ("businesId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
