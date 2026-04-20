/*
  Warnings:

  - A unique constraint covering the columns `[campus_id,slug]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Made the column `campus_id` on table `rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_campus_id_fkey";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "campus_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_campus_id_slug_key" ON "rooms"("campus_id", "slug");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
