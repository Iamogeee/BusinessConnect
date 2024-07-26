/*
  Warnings:

  - You are about to drop the `BusinessService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessService" DROP CONSTRAINT "BusinessService_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessService" DROP CONSTRAINT "BusinessService_serviceId_fkey";

-- DropTable
DROP TABLE "BusinessService";

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "query" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);
