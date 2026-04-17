/*
  Warnings:

  - You are about to drop the column `block` on the `campuses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campuses" DROP COLUMN "block";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "block" TEXT;
