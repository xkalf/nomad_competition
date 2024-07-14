import { createCubeTypeSchema, getUpdateSchema } from "~/utils/zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { competitionsToCubeType, cubeTypes } from "~/server/db/schema";
import { and, eq, exists } from "drizzle-orm";
import { z } from "zod";

export const cubeTypesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const res = await ctx.db.query.cubeTypes.findMany({
        orderBy: (t) => [t.order],
      });

      return res;
    } catch (err) {
      console.log(err);
      return [];
    }
  }),
  create: adminProcedure
    .input(createCubeTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(cubeTypes).values(input);
    }),
  update: adminProcedure
    .input(getUpdateSchema(createCubeTypeSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cubeTypes)
        .set(input)
        .where(eq(cubeTypes.id, input.id));
    }),
  delete: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(cubeTypes).where(eq(cubeTypes.id, input));
  }),
  getByCompetitionId: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const sq = ctx.db
        .select({
          id: competitionsToCubeType.cubeTypeId,
        })
        .from(competitionsToCubeType)
        .where(
          and(
            eq(competitionsToCubeType.competitionId, input),
            eq(cubeTypes.id, competitionsToCubeType.cubeTypeId),
          ),
        );

      const res = await ctx.db
        .select()
        .from(cubeTypes)
        .where(exists(sq))
        .orderBy(cubeTypes.order);

      return res;
    }),
});
