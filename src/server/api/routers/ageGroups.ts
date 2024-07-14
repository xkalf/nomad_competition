import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import {
  createAgeGroupManySchema,
  createAgeGroupSchema,
  getUpdateSchema,
} from "~/utils/zod";
import { ageGroups } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const ageGroupRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.ageGroups.findMany({
        where: (t, { eq }) => eq(t.competitionId, input),
        with: {
          cubeType: true,
        },
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
  createMany: adminProcedure
    .input(createAgeGroupManySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .delete(ageGroups)
          .where(eq(ageGroups.competitionId, input.competitionId));

        const values: (typeof ageGroups.$inferInsert)[] = input.data.flatMap(
          (i) => {
            const cubeTypes = i.cubeTypes;

            return cubeTypes.map((ct) => ({
              ...i,
              competitionId: input.competitionId,
              cubeTypeId: ct,
            }));
          },
        );

        await db.insert(ageGroups).values(values);
      });
    }),
  delete: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(ageGroups).where(eq(ageGroups.id, input));
  }),
});
