import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { rounds } from "~/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import {
  createRoundManySchema,
  createRoundSchema,
  getUpdateSchema,
} from "~/utils/zod";

export const roundsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        cubeTypeId: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.rounds.findMany({
        where: and(
          eq(rounds.competitionId, input.competitionId),
          eq(rounds.cubeTypeId, input.cubeTypeId ?? 0).if(input.cubeTypeId),
        ),
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
        const current = await db
          .select({
            id: rounds.id,
          })
          .from(rounds)
          .where(
            inArray(
              rounds.id,
              input.data
                .map((i) => i.id)
                .filter((i): i is NonNullable<typeof i> => !!i),
            ),
          );

        const insertValues: (typeof rounds.$inferInsert)[] = [];

        for (const i of input.data) {
          const found = current.find((c) => c.id === i.id);

          if (found) {
            await db.update(rounds).set(i).where(eq(rounds.id, found.id));
          } else {
            insertValues.push(
              ...i.cubeTypes.map((j) => {
                return {
                  ...i,
                  cubeTypeId: j,
                  competitionId: input.competitionId,
                };
              }),
            );
          }
        }

        await db.insert(rounds).values(insertValues);
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
