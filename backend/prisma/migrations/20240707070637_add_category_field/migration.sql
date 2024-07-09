/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BusinessCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BusinessCategories" DROP CONSTRAINT "_BusinessCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessCategories" DROP CONSTRAINT "_BusinessCategories_B_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "_BusinessCategories";
