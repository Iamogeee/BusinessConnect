-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_businessId_fkey";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_id_fkey" FOREIGN KEY ("id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
