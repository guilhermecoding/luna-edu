/*
  Warnings:

  - Made the column `address` on table `campuses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "campuses" ALTER COLUMN "address" SET NOT NULL;
