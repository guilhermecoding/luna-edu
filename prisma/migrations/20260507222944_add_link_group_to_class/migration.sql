/*
  Warnings:

  - You are about to drop the column `whatsapp_link` on the `class_groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "class_groups" DROP COLUMN "whatsapp_link",
ADD COLUMN     "group_link" TEXT;
