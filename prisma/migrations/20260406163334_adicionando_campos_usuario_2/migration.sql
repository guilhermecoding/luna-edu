/*
  Warnings:

  - A unique constraint covering the columns `[email,cpf]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "auth"."user_cpf_key";

-- DropIndex
DROP INDEX "auth"."user_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_email_cpf_key" ON "auth"."user"("email", "cpf");
