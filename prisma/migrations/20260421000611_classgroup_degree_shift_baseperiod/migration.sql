/*
  Warnings:

  - Added the required column `base_period` to the `class_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree_id` to the `class_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `class_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class_groups" ADD COLUMN     "base_period" SMALLINT NOT NULL,
ADD COLUMN     "degree_id" UUID NOT NULL,
ADD COLUMN     "shift" "shift" NOT NULL;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_degree_id_fkey" FOREIGN KEY ("degree_id") REFERENCES "degrees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
