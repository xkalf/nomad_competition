import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import {
  competitionsToCubeType,
  cubeTypes,
  groups,
  rounds,
} from "~/server/db/schema";
import { and, eq, exists } from "drizzle-orm";
import { Scrambow } from "scrambow";

export const groupRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        cubeTypeId: z.number().int().positive().optional(),
        roundId: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = ctx.db.query.groups.findMany({
        where: and(
          eq(groups.competitionId, input.competitionId),
          eq(groups.cubeTypeId, input.cubeTypeId ?? 0).if(input.cubeTypeId),
          eq(groups.roundId, input.roundId ?? 0).if(input.roundId),
        ),
        with: {
          cubeType: true,
          round: true,
        },
      });

      return res;
    }),
  generate: adminProcedure
    .input(
      /**
       * @input {number}  competitionId
       */
      z.number().int().positive(),
    )
    .mutation(async ({ ctx, input }) => {
      const scrambow = new Scrambow();

      const types = await ctx.db
        .select({
          id: cubeTypes.id,
          name: cubeTypes.name,
          scrambleMapper: cubeTypes.scrambleMapper,
        })
        .from(cubeTypes)
        .where(
          exists(
            ctx.db
              .select({
                id: competitionsToCubeType.cubeTypeId,
              })
              .from(competitionsToCubeType)
              .where(eq(competitionsToCubeType.competitionId, input)),
          ),
        );

      let insertValues: (typeof groups.$inferInsert)[] = [];

      for (const type of types) {
        const roundCount = await ctx.db
          .select({
            id: rounds.id,
            perGroupCount: rounds.perGroupCount,
          })
          .from(rounds)
          .where(
            and(
              eq(rounds.competitionId, input),
              eq(rounds.cubeTypeId, type.id),
            ),
          );

        for (const round of roundCount) {
          for (let i = 1; i <= round.perGroupCount; i++) {
            const scrambles = scrambow
              .setType(type.scrambleMapper ?? "333")
              .get(7);

            insertValues.push(
              ...scrambles.map((scramble) => {
                return {
                  name: i.toString(),
                  competitionId: input,
                  cubeTypeId: type.id,
                  roundId: round.id,
                  scramble: scramble.scramble_string,
                };
              }),
            );
          }
        }
      }
      await ctx.db.transaction(async (db) => {
        await db.delete(groups).where(eq(groups.competitionId, input));
        await db.insert(groups).values(insertValues);
      });
    }),
});
