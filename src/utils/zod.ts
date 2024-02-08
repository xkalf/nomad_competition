import { createInsertSchema } from "drizzle-zod";
import { ZodObject, ZodRawShape, z } from "zod";
import {
  ageGroups,
  competitions,
  competitors,
  cubeTypes,
  schedules,
  users,
} from "~/server/db/schema";

export const getUpdateSchema = <T extends ZodRawShape>(input: ZodObject<T>) => {
  return input.partial().extend({
    id: z.number().int().positive(),
  });
};

export const createCompetitionSchema = createInsertSchema(competitions).extend({
  cubeTypes: z.number().int().positive().array(),
});

export const registerSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
});

export const createCubeTypeSchema = createInsertSchema(cubeTypes).omit({
  id: true,
});

export const competitionRegisterSchema = createInsertSchema(competitors)
  .omit({
    id: true,
    userId: true,
    requestedAt: true,
    verifiedAt: true,
  })
  .extend({
    cubeTypes: z.number().int().positive().array(),
  });

export const createScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const createAgeGroupSchema = createInsertSchema(ageGroups).omit({
  id: true,
});
