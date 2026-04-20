/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `subjects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subjects" ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");
