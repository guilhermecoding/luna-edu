-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_teacher_id_fkey";

-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "teacher_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
