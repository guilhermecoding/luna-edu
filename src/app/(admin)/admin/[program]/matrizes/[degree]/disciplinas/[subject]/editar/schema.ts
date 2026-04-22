import z from "zod";
import { createSubjectSchema } from "../../novo/schema";

/** Edição: código interno não vem do cliente (imutável após criação). */
export const editSubjectSchema = createSubjectSchema.omit({ code: true });
export type EditSubjectInput = z.infer<typeof editSubjectSchema>;
