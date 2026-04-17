/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `campuses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `campuses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "campuses" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "campuses_slug_key" ON "campuses"("slug");
