/*
  Warnings:

  - You are about to drop the column `is_done` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "is_done",
ADD COLUMN     "attendance_updated_at" TIMESTAMP(3);
