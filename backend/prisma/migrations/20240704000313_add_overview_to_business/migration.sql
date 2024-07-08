/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Business` table. All the data in the column will be lost.
  - The `businessHours` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_categoryId_fkey";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "categoryId",
ADD COLUMN     "overview" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "photos" TEXT[],
DROP COLUMN "businessHours",
ADD COLUMN     "businessHours" TEXT[];

-- CreateTable
CREATE TABLE "_BusinessCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessCategories_AB_unique" ON "_BusinessCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessCategories_B_index" ON "_BusinessCategories"("B");

-- AddForeignKey
ALTER TABLE "_BusinessCategories" ADD CONSTRAINT "_BusinessCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessCategories" ADD CONSTRAINT "_BusinessCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
