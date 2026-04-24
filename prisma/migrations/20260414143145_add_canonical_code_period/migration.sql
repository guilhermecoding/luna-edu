/*
  Warnings:

  - A unique constraint covering the columns `[canonical_code]` on the table `periods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_program,slug]` on the table `periods` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `periods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "periods" ADD COLUMN     "canonical_code" UUID DEFAULT gen_random_uuid(),
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "periods_canonical_code_key" ON "periods"("canonical_code");

-- CreateIndex
CREATE UNIQUE INDEX "periods_id_program_slug_key" ON "periods"("id_program", "slug");
