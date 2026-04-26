/*
  Warnings:

  - A unique constraint covering the columns `[luna_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[luna_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "luna_id" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "luna_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_luna_id_key" ON "auth"."user"("luna_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_luna_id_key" ON "students"("luna_id");
