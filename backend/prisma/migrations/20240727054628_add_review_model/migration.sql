-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
