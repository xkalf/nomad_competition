import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { rounds } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  createRoundManySchema,
  createRoundSchema,
  getUpdateSchema,
} from "~/utils/zod";

export const roundsRouter = createTRPCRouter({
  getByCompetitionId: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.rounds.findMany({
        where: eq(rounds.competitionId, input),
        with: {
          cubeType: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      });

      return res;
    }),
  createMany: adminProcedure
    .input(createRoundManySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .delete(rounds)
          .where(eq(rounds.competitionId, input.competitionId));

        await db.insert(rounds).values(
          input.data.map((i) => ({
            ...i,
            competitionId: input.competitionId,
          })),
        );
      });
    }),
  create: adminProcedure
    .input(createRoundSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rounds).values(input);
    }),
  update: adminProcedure
    .input(getUpdateSchema(createRoundSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(rounds).set(input).where(eq(rounds.id, input.id));
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(rounds).where(eq(rounds.id, input));
    }),
});
