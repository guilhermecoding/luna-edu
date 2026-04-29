import { z } from "zod";

/** Valores alinhados a `Genre` / `UserGenre` no Prisma e ao Better Auth. */
export const GENRE_VALUES = ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"] as const;

export type GenreValue = (typeof GENRE_VALUES)[number];

export const GENRE_LABELS_PT: Record<GenreValue, string> = {
    MALE: "Masculino",
    FEMALE: "Feminino",
    NON_BINARY: "Não-binário",
    PREFER_NOT_TO_SAY: "Prefiro não informar",
};

export const genreZodSchema = z.enum(GENRE_VALUES);
