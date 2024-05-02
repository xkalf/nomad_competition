import { createFeeSchema, getUpdateSchema } from "~/utils/zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { fees } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const feeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.fees.findMany({
      with: {
        cubeType: true,
      },
    });

    return res.sort((t) => t.cubeType.order);
  }),
  getByCompetitionId: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.fees.findMany({
        where: (t, { eq }) => eq(t.competitionId, input),
        with: {
          cubeType: true,
        },
      });

      return res.sort((t) => t.cubeType.order);
    }),
  create: adminProcedure
    .input(createFeeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(fees).values(input);
    }),
  update: adminProcedure
    .input(getUpdateSchema(createFeeSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(fees).set(input).where(eq(fees.id, input.id));
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(fees).where(eq(fees.id, input));
    }),
});
