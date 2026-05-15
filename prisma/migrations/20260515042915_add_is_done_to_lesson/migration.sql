-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "is_present" SET DEFAULT true;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "is_done" BOOLEAN NOT NULL DEFAULT false;
