/*
  Warnings:

  - You are about to drop the column `age` on the `students` table. All the data in the column will be lost.
  - Added the required column `birth_date` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "age",
ADD COLUMN     "birth_date" DATE NOT NULL;
