/*
  Warnings:

  - Added the required column `businessId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "businessId" INTEGER NOT NULL,
ADD COLUMN     "reviewId" INTEGER NOT NULL;
