/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `programs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `programs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");
