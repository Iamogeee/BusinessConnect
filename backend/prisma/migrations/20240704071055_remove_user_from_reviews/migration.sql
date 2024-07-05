/*
  Warnings:

  - You are about to drop the column `businessId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "businessId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
