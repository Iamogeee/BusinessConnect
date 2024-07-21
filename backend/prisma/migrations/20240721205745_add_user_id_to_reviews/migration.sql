-- Step 1: Add the userId column with a default value
ALTER TABLE "Review" ADD COLUMN "userId" INTEGER DEFAULT 1;

-- Step 3: Remove the default value and set the column to NOT NULL
ALTER TABLE "Review" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Review" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
