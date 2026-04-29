/*
  Warnings:

  - You are about to drop the column `provider_type` on the `account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth"."account" DROP COLUMN "provider_type";
