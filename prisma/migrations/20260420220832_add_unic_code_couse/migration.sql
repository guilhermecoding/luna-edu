/*
  Warnings:

  - A unique constraint covering the columns `[period_id,code]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "courses_code_key";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "code" DROP DEFAULT,
ALTER COLUMN "code" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "courses_period_id_code_key" ON "courses"("period_id", "code");
