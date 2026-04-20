/*
  Warnings:

  - A unique constraint covering the columns `[program_id,slug]` on the table `degrees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "degrees_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "degrees_program_id_slug_key" ON "degrees"("program_id", "slug");
