-- AlterTable
ALTER TABLE "better_auth"."user" ADD COLUMN     "genre" "better_auth"."user_genre" NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
ADD COLUMN     "system_role" "better_auth"."system_role" NOT NULL DEFAULT 'FULL_ACCESS';
