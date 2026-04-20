/*
  Warnings:

  - You are about to drop the column `order` on the `time_slots` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[program_id,start_time]` on the table `time_slots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "time_slots_program_id_order_key";

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "order";

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_program_id_start_time_key" ON "time_slots"("program_id", "start_time");
