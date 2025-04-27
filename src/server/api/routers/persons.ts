import { and, desc, eq, exists, gt, sql } from 'drizzle-orm'
import {
  ageGroupMedals,
  competitions,
  competitors,
  cubeTypes,
  medals,
  rankAverage,
  rankSingle,
  results,
  rounds,
  users,
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
      const rank = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        with: {
          rankAverage: true,
          rankSingle: true,
        },
      })

      if (!rank) {
        throw new Error('Тамирчин олдсонгүй.')
      }

      type Grouped = {
        [cubeTypeId: number]: {
          average?: Pick<
            typeof rankAverage.$inferSelect,
            'allRank' | 'provinceRank' | 'districtRank' | 'value'
          >
          single?: Pick<
            typeof rankSingle.$inferSelect,
            'allRank' | 'provinceRank' | 'districtRank' | 'value'
          >
        }
      }

      let grouped: Grouped = {}

      const updateGrouped = (
        r: Pick<
          typeof rankSingle.$inferSelect,
          'allRank' | 'provinceRank' | 'districtRank' | 'value' | 'cubeTypeId'
        >,
        key: 'average' | 'single',
      ) => {
        if (!grouped[r.cubeTypeId]) {
          grouped[r.cubeTypeId] = {}
        }

        grouped[r.cubeTypeId] = {
          ...grouped[r.cubeTypeId],
          [key]: {
            value: r.value,
            allRank: r.allRank,
            provinceRank: r.provinceRank,
            districtRank: r.districtRank,
          },
        }
      }

      rank.rankSingle.forEach((r) => updateGrouped(r, 'single'))
      rank.rankAverage.forEach((r) => updateGrouped(r, 'average'))

      return grouped
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
  getMedalsCount: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const query = await ctx.db
        .select({
          first:
            sql<number>`count(${medals.medal}) filter (where ${medals.medal} = 1)`.as(
              'first',
            ),
          second:
            sql<number>`count(${medals.medal}) filter (where ${medals.medal} = 2)`.as(
              'second',
            ),
          third:
            sql<number>`count(${medals.medal}) filter (where ${medals.medal} = 3)`.as(
              'third',
            ),
        })
        .from(medals)
        .where(eq(medals.userId, input.userId))

      return query[0]
    }),
  getAgeGroupMedalsCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const query = await ctx.db
        .select({
          first:
            sql<number>`count(${ageGroupMedals.medal}) filter (where ${ageGroupMedals.medal} = 1)`.as(
              'first',
            ),
          second:
            sql<number>`count(${ageGroupMedals.medal}) filter (where ${ageGroupMedals.medal} = 2)`.as(
              'second',
            ),
          third:
            sql<number>`count(${ageGroupMedals.medal}) filter (where ${ageGroupMedals.medal} = 3)`.as(
              'third',
            ),
        })
        .from(ageGroupMedals)
        .where(eq(ageGroupMedals.userId, input.userId))

      return query[0]
    }),
})
