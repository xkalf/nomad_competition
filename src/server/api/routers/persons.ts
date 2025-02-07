import { and, desc, eq, exists, gt, min, sql } from 'drizzle-orm'
import {
  competitions,
  competitors,
  cubeTypes,
  results,
  rounds,
} from '~/server/db/schema'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import groupBy from 'lodash.groupby'

export const personsRouter = createTRPCRouter({
  getPersonalRecords: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const competitorsSql = ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(
          and(
            eq(competitors.userId, input.userId),
            eq(competitors.id, results.competitorId),
          ),
        )

      const pbs = await ctx.db
        .select({
          cubeTypeId: results.cubeTypeId,
          best: min(results.best),
          average: min(results.average),
          cubeType: {
            name: cubeTypes.name,
            image: cubeTypes.image,
          },
        })
        .from(results)
        .leftJoin(cubeTypes, eq(cubeTypes.id, results.cubeTypeId))
        .where(
          and(
            exists(competitorsSql),
            gt(results.best, 0),
            gt(results.average, 0),
          ),
        )
        .orderBy(cubeTypes.order)
        .groupBy(
          results.cubeTypeId,
          cubeTypes.name,
          cubeTypes.image,
          cubeTypes.order,
        )

      return pbs
    }),
  getCompetitionResults: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const competitorsSql = ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(
          and(
            eq(competitors.userId, input.userId),
            eq(competitors.id, results.competitorId),
          ),
        )

      const _results = await ctx.db
        .select({
          id: results.id,
          competition: {
            id: competitions.id,
            name: competitions.name,
          },
          round: {
            id: rounds.id,
            name: rounds.name,
          },
          cubeType: {
            id: cubeTypes.id,
            name: cubeTypes.name,
            image: cubeTypes.image,
          },
          best: results.best,
          average: results.average,
          solve1: results.solve1,
          solve2: results.solve2,
          solve3: results.solve3,
          solve4: results.solve4,
          solve5: results.solve5,
          place:
            sql`RANK() OVER (PARTITION BY ${results.cubeTypeId} ORDER BY ${results.average})`.mapWith(
              Number,
            ),
        })
        .from(results)
        .leftJoin(competitions, eq(competitions.id, results.competitionId))
        .leftJoin(rounds, eq(rounds.id, results.roundId))
        .leftJoin(cubeTypes, eq(cubeTypes.id, results.cubeTypeId))
        .where(and(exists(competitorsSql), gt(results.average, 0)))
        .orderBy(desc(competitions.startDate), desc(rounds.name))

      const grouped = groupBy(
        _results,
        (r) => `${r.cubeType?.name}:${r.cubeType?.image}`,
      )

      return grouped
    }),
})
