-- CreateEnum
CREATE TYPE "room_type" AS ENUM ('CLASSROOM', 'LABORATORY', 'AUDITORIUM', 'OTHERS');

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "type" "room_type" NOT NULL DEFAULT 'CLASSROOM';
