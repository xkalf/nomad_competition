import { createResultSchema } from '~/utils/zod'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc'
import { getAverage, getBest } from '~/server/utils/calculate'
import {
  ageGroups,
  competitors,
  cubeTypes,
  results,
  rounds,
  schools,
  users,
} from '~/server/db/schema'
import { z } from 'zod'
import { and, eq, getTableColumns, gte, lt, ne, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { jsonBuildObject } from '~/server/utils/drizzle.helper'

export const resultsRouter = createTRPCRouter({
  findByRound: publicProcedure
    .input(
      z
        .object({
          roundId: z.number().int().positive(),
          isOther: z.boolean().default(false),
          ageGroupId: z.number().int().positive().optional(),
        })
        .merge(createSelectSchema(schools).omit({ id: true }).partial()),
    )
    .query(async ({ ctx, input }) => {
      const ageGroupsSql = ctx.db.$with('age-groups').as(
        ctx.db
          .select({
            start: ageGroups.start,
            end: ageGroups.end,
            competitionId: ageGroups.competitionId,
          })
          .from(ageGroups)
          .where(
            eq(ageGroups.id, input.ageGroupId ?? 0).if(!!input.ageGroupId),
          ),
      )
      return await ctx.db
        .with(ageGroupsSql)
        .select({
          ...getTableColumns(results),
          competitor: jsonBuildObject({
            verifiedId: competitors.verifiedId,
            user: users,
          }),
        })
        .from(results)
        .leftJoin(competitors, eq(results.competitorId, competitors.verifiedId))
        .leftJoin(users, eq(users.id, competitors.userId))
        .leftJoin(schools, eq(schools.id, competitors.schoolId))
        .leftJoin(
          ageGroupsSql,
          eq(ageGroupsSql.competitionId, results.competitionId),
        )
        .where(
          and(
            eq(results.roundId, input.roundId),
            eq(schools.province, input.province ?? '').if(
              !!input.province && !input.isOther,
            ),
            eq(schools.district, input.district ?? '').if(
              !!input.district && !input.isOther,
            ),
            eq(schools.school, input.school ?? '').if(
              !!input.school && !input.isOther,
            ),
            ne(schools.province, input.province ?? '').if(
              !!input.province && input.isOther,
            ),
            ne(schools.district, input.district ?? '').if(
              !!input.district && input.isOther,
            ),
            ne(schools.school, input.school ?? '').if(
              !!input.school && input.isOther,
            ),
            gte(
              sql`(extract(year from ${users.birthDate}))`,
              ageGroupsSql.start,
            ).if(!!input.ageGroupId),
            lt(
              sql`(extract(year from ${users.birthDate}))`,
              ageGroupsSql.end,
            ).if(!!input.ageGroupId),
          ),
        )
        .orderBy(
          sql`case when ${results.average} < 0 then 1 else 0 end`,
          results.average,
          results.best,
        )
    }),
  create: adminProcedure
    .input(createResultSchema)
    .mutation(async ({ ctx, input }) => {
      const solves = [
        input.solve1,
        input.solve2,
        input.solve3,
        input.solve4,
        input.solve5,
      ].filter((i): i is number => typeof i === 'number')

      const [competitor] = await ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(eq(competitors.verifiedId, input.verifiedId))

      if (!competitor) {
        throw new Error('Тамирчин олдсонгүй.')
      }

      const [round] = await ctx.db
        .select({
          competitionId: rounds.competitionId,
          type: cubeTypes.type,
        })
        .from(rounds)
        .where(eq(rounds.id, input.roundId))
        .leftJoin(cubeTypes, eq(cubeTypes.id, rounds.cubeTypeId))

      if (!round) {
        throw new Error('Раунд олдсонгүй.')
      }

      const best = getBest(solves)
      const average = getAverage(solves, round.type ?? 'ao5')

      await ctx.db
        .update(results)
        .set({
          solve1: input.solve1,
          solve2: input.solve2,
          solve3: input.solve3,
          solve4: input.solve4,
          solve5: input.solve5,
          average,
          best,
        })
        .where(
          and(
            eq(results.competitorId, competitor.id),
            eq(results.roundId, input.roundId),
            eq(results.competitionId, round.competitionId),
          ),
        )
    }),
  generate: adminProcedure
    .input(
      /**
       * @input roundId
       */
      z
        .number()
        .int()
        .positive(),
    )
    .mutation(async ({ ctx, input }) => {
      const [round] = await ctx.db
        .select({
          competitionId: rounds.competitionId,
          type: cubeTypes.type,
          cubeTypeId: rounds.cubeTypeId,
          perGroupCount: rounds.perGroupCount,
        })
        .from(rounds)
        .where(eq(rounds.id, input))
        .leftJoin(cubeTypes, eq(cubeTypes.id, rounds.cubeTypeId))

      if (!round) {
        throw new Error('Раунд олдсонгүй.')
      }

      const comps = await ctx.db.query.competitors.findMany({
        where: (t, { isNotNull, and, eq }) =>
          and(
            eq(t.competitionId, round.competitionId),
            isNotNull(t.verifiedAt),
          ),
        columns: {
          id: true,
        },
      })

      if (comps.length === 0) {
        throw new Error('Тамирчин хоосон байна.')
      }

      await ctx.db.insert(results).values(
        comps.map((comp, index): typeof results.$inferInsert => ({
          roundId: input,
          cubeTypeId: round.cubeTypeId,
          competitionId: round.competitionId,
          competitorId: comp.id,
          type: round.type ?? 'ao5',
          createdUserId: ctx.session.user.id,
          updatedUserId: ctx.session.user.id,
          group: `${Math.floor(index / round.perGroupCount) + 1}`,
        })),
      )
    }),
})
