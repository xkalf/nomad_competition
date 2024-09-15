import { z } from 'zod'
import { adminProcedure, createTRPCRouter } from '../trpc'
import {
  competitionsToCubeType,
  cubeTypes,
  groups,
  rounds,
} from '~/server/db/schema'
import { and, eq, exists } from 'drizzle-orm'
import { Scrambow } from 'scrambow'

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
      })

      return res
    }),
  generate: adminProcedure
    .input(
      /**
       * @input {number}  competitionId
       */
      z
        .number()
        .int()
        .positive(),
    )
    .mutation(async ({ ctx, input }) => {
      const scrambow = new Scrambow()

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
        )

      let insertValues: (typeof groups.$inferInsert)[] = []

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
          )

        let num = 1

        for (const round of roundCount) {
          const scrambles = scrambow
            .setType(type.name)
            .get(7 * round.perGroupCount)

          insertValues.push(
            ...scrambles.map((scramble) => {
              return {
                name: num.toString(),
                competitionId: input,
                cubeTypeId: type.id,
                roundId: round.id,
                scramble: scramble.scramble_string,
              }
            }),
          )

          num++
        }
      }
      await ctx.db.insert(groups).values(insertValues)
    }),
})
