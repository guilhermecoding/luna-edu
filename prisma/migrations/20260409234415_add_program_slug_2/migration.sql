-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('HOMEWORK', 'EXAM', 'PROJECT', 'QUIZ', 'PARTICIPATION');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('INFO', 'WARNING', 'ALERT');

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "due_date" TIMESTAMPTZ,
ADD COLUMN     "type" "activity_type" NOT NULL DEFAULT 'HOMEWORK',
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "final_grades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "average" DOUBLE PRECISION,
    "concept" TEXT,
    "is_approved" BOOLEAN,

    CONSTRAINT "final_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_course_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "attendance_rate" DOUBLE PRECISION,
    "average_grade" DOUBLE PRECISION,
    "total_lessons" INTEGER,
    "present_count" INTEGER,

    CONSTRAINT "student_course_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "notification_type" NOT NULL DEFAULT 'INFO',
    "user_id" UUID,
    "student_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "final_grades_course_id_student_id_key" ON "final_grades"("course_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_course_stats_course_id_student_id_key" ON "student_course_stats"("course_id", "student_id");

-- AddForeignKey
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_stats" ADD CONSTRAINT "student_course_stats_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_stats" ADD CONSTRAINT "student_course_stats_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
