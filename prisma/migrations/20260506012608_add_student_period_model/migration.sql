-- CreateTable
CREATE TABLE "student_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_periods_student_id_period_id_key" ON "student_periods"("student_id", "period_id");

-- AddForeignKey
ALTER TABLE "student_periods" ADD CONSTRAINT "student_periods_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_periods" ADD CONSTRAINT "student_periods_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
