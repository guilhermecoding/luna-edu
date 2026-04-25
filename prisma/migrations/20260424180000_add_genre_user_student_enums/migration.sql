-- CreateEnum (public): students.genre
CREATE TYPE "genre" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum (auth): auth.user.genre
CREATE TYPE "auth"."user_genre" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- Normalize legacy free-text values on students before cast
UPDATE "students"
SET "genre" = CASE
    WHEN UPPER(TRIM("genre")) IN ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY') THEN UPPER(TRIM("genre"))
    WHEN LOWER(TRIM("genre")) IN ('m', 'male', 'masculino', 'homem', 'h') THEN 'MALE'
    WHEN LOWER(TRIM("genre")) IN ('f', 'female', 'feminino', 'mulher') THEN 'FEMALE'
    WHEN LOWER(TRIM("genre")) IN ('nb', 'non_binary', 'nonbinary', 'não binário', 'nao binario', 'o', 'outro', 'other') THEN 'NON_BINARY'
    WHEN LOWER(TRIM("genre")) IN (
        'prefer_not_to_say',
        'prefiro não informar',
        'prefiro nao informar',
        'nao informado',
        'não informado',
        'ni',
        'x',
        '-',
        ''
    ) THEN 'PREFER_NOT_TO_SAY'
    ELSE 'PREFER_NOT_TO_SAY'
END;

-- AlterTable: students.genre text -> enum
ALTER TABLE "students" ALTER COLUMN "genre" TYPE "genre" USING ("genre"::"genre");

-- AlterTable: auth.user add genre
ALTER TABLE "auth"."user" ADD COLUMN "genre" "auth"."user_genre" NOT NULL DEFAULT 'PREFER_NOT_TO_SAY'::"auth"."user_genre";
