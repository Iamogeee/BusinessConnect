/*
  Warnings:

  - A unique constraint covering the columns `[name,businessId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Review_name_businessId_key" ON "Review"("name", "businessId");
