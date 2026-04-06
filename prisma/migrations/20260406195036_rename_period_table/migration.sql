/*
  Warnings:

  - You are about to drop the column `term_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the `terms` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `period_id` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_term_id_fkey";

-- DropForeignKey
ALTER TABLE "terms" DROP CONSTRAINT "terms_id_program_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "term_id",
ADD COLUMN     "period_id" UUID NOT NULL;

-- DropTable
DROP TABLE "terms";

-- CreateTable
CREATE TABLE "periods" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "id_program" UUID NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_id_program_fkey" FOREIGN KEY ("id_program") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
