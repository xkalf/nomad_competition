import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import {
  competitionsToCubeType,
  cubeTypes,
  groups,
  rounds,
} from "~/server/db/schema";
import { and, count, eq, exists, getTableColumns } from "drizzle-orm";
import { Scrambow } from "scrambow";
import { TRPCError } from "@trpc/server";

export const groupRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = ctx.db.query.groups.findMany({
        where: eq(groups.competitionId, input),
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
          const scrambles = scrambow
            .setType(type.name)
            .get(7 * round.perGroupCount);

          let letter = "A";

          insertValues.push(
            ...scrambles.map((scramble, index) => {
              const curr = letter;
              letter =
                letter === "Z" || index % 7 === 0
                  ? "A"
                  : String.fromCharCode(letter.charCodeAt(0) + 1);
              return {
                name: curr,
                competitionId: input,
                cubeTypeId: type.id,
                roundId: round.id,
                scramble: scramble.scramble_string,
              };
            }),
          );
        }
      }
      await ctx.db.insert(groups).values(insertValues);
    }),
});
