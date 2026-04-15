-- CreateIndex
CREATE INDEX "periods_id_program_completed_at_start_date_end_date_idx" ON "periods"("id_program", "completed_at", "start_date", "end_date");
