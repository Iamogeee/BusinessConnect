/*
  Warnings:

  - You are about to drop the column `businessId` on the `Recommendation` table. All the data in the column will be lost.
  - Added the required column `recommendations` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_businessId_fkey";

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "businessId",
ADD COLUMN     "recommendations" JSONB NOT NULL;
