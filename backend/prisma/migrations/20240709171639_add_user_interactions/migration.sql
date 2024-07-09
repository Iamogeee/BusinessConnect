-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "liked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false;
