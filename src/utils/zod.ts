import { createInsertSchema } from "drizzle-zod";
import { ZodObject, ZodRawShape, z } from "zod";
import { competitions } from "~/server/db/schema";

export const getUpdateSchema = <T extends ZodRawShape>(input: ZodObject<T>) => {
  return input.partial().extend({
    id: z.number().int().positive(),
  });
};

export const createCompetitionSchema = createInsertSchema(competitions).extend({
  cubeTypes: z.number().int().positive().array(),
});
