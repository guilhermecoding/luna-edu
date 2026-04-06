/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birth_date` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "auth"."system_role" AS ENUM ('FULL_ACCESS', 'READ_ONLY');

-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_teacher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "system_role" "auth"."system_role" NOT NULL DEFAULT 'FULL_ACCESS';

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "auth"."user"("cpf");
