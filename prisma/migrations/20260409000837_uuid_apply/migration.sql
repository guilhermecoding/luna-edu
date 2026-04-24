/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `session` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `verification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `granding_type` on the `activities` table. All the data in the column will be lost.
  - Changed the type of `user_id` on the `account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assistant_id` on the `course_assistants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "course_assistants" DROP CONSTRAINT "course_assistants_assistant_id_fkey";

-- AlterTable
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."user" DROP CONSTRAINT "user_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."verification" DROP CONSTRAINT "verification_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "granding_type",
ADD COLUMN     "grading_type" "grading_type" NOT NULL DEFAULT 'NONE',
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "activity_grades" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "campuses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "course_assistants" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "assistant_id",
ADD COLUMN     "assistant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "code" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "periods" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "programs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "auth"."account"("user_id");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "auth"."session"("user_id");

-- AddForeignKey
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assistants" ADD CONSTRAINT "course_assistants_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "auth"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
