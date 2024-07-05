-- Inside the generated migration SQL file
-- Create the new Category table
CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- Insert a default category (e.g., "Uncategorized")
INSERT INTO "Category" ("name") VALUES ('Uncategorized');

-- Add the new categoryId column to the Business table with a default value (assuming id of "Uncategorized" is 1)
ALTER TABLE "Business" ADD COLUMN "categoryId" INTEGER DEFAULT 1 NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "Business" ADD CONSTRAINT "Business_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id");
