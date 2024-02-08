import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { createAgeGroupSchema, getUpdateSchema } from "~/utils/zod";
import { ageGroups } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const ageGroupRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.ageGroups.findMany({
        where: (t, { eq }) => eq(t.competitionId, input),
      });

      return res;
    }),
  create: adminProcedure
    .input(createAgeGroupSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(ageGroups).values(input);
    }),
  update: adminProcedure
    .input(getUpdateSchema(createAgeGroupSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(ageGroups)
        .set(input)
        .where(eq(ageGroups.id, input.id));
    }),
});
