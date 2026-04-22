import z from "zod";
import { createCampusSchema } from "../../novo/schema";

/** Edição: slug não vem do cliente (imutável após criação). */
export const editCampusSchema = createCampusSchema.omit({ slug: true });
export type EditCampusInput = z.infer<typeof editCampusSchema>;
