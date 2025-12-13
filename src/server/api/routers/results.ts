import * as cheerio from 'cheerio'
import {
  and,
  eq,
  exists,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
  ageGroupMedals,
  ageGroups,
  competitors,
  competitorsToCubeTypes,
  cubeTypes,
  medals,
  results,
  rounds,
  schools,
  users,
} from '~/server/db/schema'
import { getAverage, getBest } from '~/server/utils/calculate'
import { jsonBuildObject } from '~/server/utils/drizzle.helper'
import { formatStringToMilliSeconds } from '~/utils/timeUtils'
import { createResultSchema } from '~/utils/zod'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc'

export const resultsRouter = createTRPCRouter({
  findByAgeGroup: publicProcedure
    .input(
      z.object({
        cubeTypeId: z.number().int().positive(),
        competitionId: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const columns = getTableColumns(results)

      const filter = and(
        eq(rounds.isAgeGroup, true),
        eq(results.cubeTypeId, input.cubeTypeId),
        eq(results.competitionId, input.competitionId),
      )

      const isFinalQuery = ctx.db.$with('isFinalQuery').as(
        ctx.db
          .select({
            competitorId: results.competitorId,
            cubeTypeId: results.cubeTypeId,
          })
          .from(results)
          .innerJoin(rounds, eq(rounds.id, results.roundId))
          .where(eq(rounds.isFinal, true)),
      )

      let query = ctx.db
        .with(isFinalQuery)
        .select({
          ...columns,
          competitor: {
            id: competitors.id,
            verifiedId: competitors.verifiedId,
            user: jsonBuildObject({
              firstname: users.firstname,
              lastname: users.lastname,
              birthDate: users.birthDate,
            }),
          },
          isFinal: sql`${isFinalQuery.competitorId} is not null`.mapWith(
            Boolean,
          ),
          ageGroupMedal: ageGroupMedals.medal,
          medal: medals.medal,
        })
        .from(results)
        .innerJoin(competitors, eq(results.competitorId, competitors.id))
        .innerJoin(users, eq(users.id, competitors.userId))
        .leftJoin(rounds, eq(rounds.id, results.roundId))
        .leftJoin(
          ageGroupMedals,
          and(
            eq(ageGroupMedals.userId, competitors.userId),
            eq(ageGroupMedals.cubeTypeId, results.cubeTypeId),
          ),
        )
        .leftJoin(
          medals,
          and(
            eq(medals.userId, competitors.userId),
            eq(medals.cubeTypeId, results.cubeTypeId),
          ),
        )
        .leftJoin(
          isFinalQuery,
          and(
            eq(isFinalQuery.competitorId, results.competitorId),
            eq(isFinalQuery.cubeTypeId, results.cubeTypeId),
          ),
        )
        .where(filter)

      const ageGroupsResult = await ctx.db.query.ageGroups.findMany({
        where: (table) =>
          and(
            eq(table.competitionId, input.competitionId),
            eq(table.cubeTypeId, input.cubeTypeId),
          ),
      })
      const res = await query
      const map = new Map<number, typeof res>()

      ageGroupsResult.forEach((ageGroup) => {
        const filtered = res
          .filter((result) => {
            const date = result.competitor.user.birthDate
            const year = +date.slice(0, 4)

            if (!ageGroup.end) {
              return ageGroup.start <= year
            }

            return ageGroup.start <= year && ageGroup.end >= year
          })
          .sort((a, b) => {
            if (!a.average || a.average < 0) return 1
            if (!b.average || b.average < 0) return -1
            if (a.average === b.average) {
              if (!a.best || a.best < 0) {
                return 1
              }
              if (!b.best || b.best < 0) {
                return -1
              }

              return a.best - b.best
            }
            return a.average - b.average
          })

        map.set(ageGroup.id, filtered)
      })

      return map
    }),
  findByRound: publicProcedure
    .input(
      z
        .object({
          roundId: z.number().int().positive(),
          isOther: z.boolean().default(false),
          ageGroupId: z.number().int().positive().optional(),
          verifiedId: z.number().int().positive().optional(),
          isSolved: z.boolean().optional(),
          isWcaId: z.boolean().optional(),
          competitorId: z.number().int().positive().optional(),
        })
        .merge(createSelectSchema(schools).omit({ id: true }).partial()),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .select({
          ...getTableColumns(results),
          competitor: {
            id: competitors.id,
            verifiedId: competitors.verifiedId,
            user: jsonBuildObject({
              firstname: users.firstname,
              lastname: users.lastname,
            }),
          },
        })
        .from(results)
        .leftJoin(competitors, eq(results.competitorId, competitors.id))
        .leftJoin(users, eq(users.id, competitors.userId))
        .leftJoin(schools, eq(schools.id, competitors.schoolId))
        .where(
          and(
            eq(results.roundId, input.roundId),
            eq(competitors.provinceId, input.provinceId ?? '').if(
              !!input.provinceId && input.isOther === false,
            ),
            eq(competitors.districtId, input.districtId ?? '').if(
              !!input.districtId && input.isOther === false,
            ),
            eq(schools.school, input.school ?? '').if(
              !!input.school && input.isOther === false,
            ),
            !!input.provinceId && input.isOther === true
              ? or(
                  ne(competitors.provinceId, input.provinceId ?? ''),
                  isNull(competitors.provinceId),
                )
              : undefined,
            ne(competitors.districtId, input.districtId ?? '').if(
              !!input.districtId && input.isOther === true,
            ),
            ne(schools.school, input.school ?? '').if(
              !!input.school && input.isOther === true,
            ),
            gte(
              sql`(extract(year from ${users.birthDate}))`,
              ageGroups.start,
            ).if(!!input.ageGroupId),
            lte(sql`(extract(year from ${users.birthDate}))`, ageGroups.end).if(
              !!input.ageGroupId,
            ),
            eq(competitors.verifiedId, input.verifiedId ?? 0).if(
              !!input.verifiedId,
            ),
            eq(competitors.id, input.competitorId ?? 0).if(
              !!input.competitorId,
            ),
            isNotNull(results.average).if(input.isSolved),
            isNotNull(users.wcaId).if(input.isWcaId === true),
            isNull(users.wcaId).if(input.isWcaId === false),
          ),
        )
        .orderBy(
          sql`case when ${results.average} is null then 2 when ${results.average} < 0 then 1 else 0 end`,
          results.average,
          sql`case when ${results.best} is null then 2 when ${results.best} < 0 then 1 else 0 end`,
          results.best,
          competitors.verifiedId,
        )
        .$dynamic()

      if (input.ageGroupId) {
        query = query.leftJoin(
          ageGroups,
          and(
            eq(ageGroups.competitionId, results.competitionId),
            eq(ageGroups.cubeTypeId, results.cubeTypeId),
            eq(ageGroups.id, input.ageGroupId),
          ),
        )
      }

      return await query
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
      ].map((i) => (typeof i === 'number' ? i : -2))

      const [round] = await ctx.db
        .select({
          id: rounds.id,
          competitionId: rounds.competitionId,
          cubeTypeId: rounds.cubeTypeId,
          type: cubeTypes.type,
        })
        .from(rounds)
        .where(eq(rounds.id, input.roundId))
        .leftJoin(cubeTypes, eq(cubeTypes.id, rounds.cubeTypeId))

      if (!round) {
        throw new Error('Раунд олдсонгүй.')
      }

      const [competitor] = await ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(
          and(
            eq(competitors.verifiedId, input.verifiedId ?? 0).if(
              !!input.verifiedId,
            ),
            eq(competitors.id, input.competitorId ?? 0).if(
              !!input.competitorId,
            ),
            eq(competitors.competitionId, round.competitionId),
          ),
        )

      if (!competitor) {
        throw new Error('Тамирчин олдсонгүй.')
      }

      const best = getBest(solves)
      const average = getAverage(solves, round.type ?? 'ao5')

      const [updated] = await ctx.db
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
            eq(results.cubeTypeId, round.cubeTypeId),
          ),
        )
        .returning()

      if (!updated) {
        await ctx.db.insert(results).values({
          cubeTypeId: round.cubeTypeId,
          competitionId: round.competitionId,
          competitorId: competitor.id,
          type: round.type ?? 'ao5',
          createdUserId: ctx.session.user.id,
          updatedUserId: ctx.session.user.id,
          group: '1',
          solve1: input.solve1,
          solve2: input.solve2,
          solve3: input.solve3,
          solve4: input.solve4,
          solve5: input.solve5,
          average,
          best,
          roundId: round.id,
        })
      }
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

      const comps = await ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(
          and(
            isNotNull(competitors.verifiedId),
            eq(competitors.competitionId, round.competitionId),
            exists(
              ctx.db
                .select({
                  1: sql`1`,
                })
                .from(competitorsToCubeTypes)
                .where(
                  and(
                    eq(competitorsToCubeTypes.competitorId, competitors.id),
                    eq(competitorsToCubeTypes.cubeTypeId, round.cubeTypeId),
                    eq(competitorsToCubeTypes.status, 'Paid'),
                  ),
                ),
            ),
          ),
        )

      if (comps.length === 0) {
        throw new Error('Тамирчин хоосон байна.')
      }

      const curr = await ctx.db
        .select()
        .from(results)
        .where(
          and(
            eq(results.roundId, input),
            eq(results.competitionId, round.competitionId),
            eq(results.cubeTypeId, round.cubeTypeId),
            isNotNull(results.best),
          ),
        )

      if (curr.length > 0) {
        throw new Error('Үзүүлэлт шивсэн байна устгах боломжгүй .')
      }

      await ctx.db
        .delete(results)
        .where(
          and(
            eq(results.roundId, input),
            eq(results.competitionId, round.competitionId),
            eq(results.cubeTypeId, round.cubeTypeId),
          ),
        )

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
  createFromWcaLive: adminProcedure
    .input(
      z.object({
        roundId: z.number().int().positive(),
        htmlText: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.query.rounds.findFirst({
        where: eq(rounds.id, input.roundId),
        with: {
          cubeType: true,
        },
      })

      if (!round) {
        throw new Error('Раунд олдсонгүй.')
      }

      const competitors = await ctx.db.query.competitors.findMany({
        where: (table) => eq(table.competitionId, round.competitionId),
        with: {
          user: true,
        },
      })

      const $ = cheerio.load(input.htmlText)

      const ins: {
        rank: string
        firstname: string
        lastname: string
        solve1: string
        solve2: string
        solve3: string
        solve4: string
        solve5: string
        average: string
        best: string
      }[] = []

      $('.MuiTableBody-root .MuiTableRow-root').each((_, el) => {
        const cells = $(el).find('.MuiTableCell-root')

        const fullName = $(cells[1]).text().trim().split(' ')
        const firstname = fullName[0] || ''
        const lastname = fullName[1] || ''

        ins.push({
          rank: $(cells[0]).text().trim(),
          firstname,
          lastname,
          solve1: $(cells[3]).text().replace('PR', '').trim(),
          solve2: $(cells[4]).text().replace('PR', '').trim(),
          solve3: $(cells[5]).text().replace('PR', '').trim(),
          solve4: $(cells[6]).text().replace('PR', '').trim(),
          solve5: $(cells[7]).text().replace('PR', '').trim(),
          average: $(cells[8]).text().replace('PR', '').trim(),
          best: $(cells[9]).text().replace('PR', '').trim(),
        })
      })

      const insertValues: (typeof results.$inferInsert)[] = []
      const notFoundCompetitors: string[] = []

      for (const result of ins) {
        const competitor = competitors.find(
          (c) =>
            c.user.firstname === result.firstname &&
            c.user.lastname === result.lastname,
        )

        if (!competitor) {
          notFoundCompetitors.push(`${result.firstname} ${result.lastname}`)
          continue
        }

        insertValues.push({
          solve1: formatStringToMilliSeconds(result.solve1),
          solve2: formatStringToMilliSeconds(result.solve2),
          solve3: formatStringToMilliSeconds(result.solve3),
          solve4: formatStringToMilliSeconds(result.solve4),
          solve5: formatStringToMilliSeconds(result.solve5),
          best: formatStringToMilliSeconds(result.best),
          average: formatStringToMilliSeconds(result.average),
          type: round.cubeType.type,
          cubeTypeId: round.cubeTypeId,
          competitionId: round.competitionId,
          competitorId: competitor.id,
          createdUserId: ctx.session.user.id,
          updatedUserId: ctx.session.user.id,
          group: '1',
          roundId: round.id,
        })
      }

      if (insertValues.length > 0) {
        await ctx.db.delete(results).where(eq(results.roundId, input.roundId))
        await ctx.db.insert(results).values(insertValues)
      }

      return {
        notFoundCompetitors,
        success: insertValues.length,
      }
    }),
  generateMedals: adminProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const competition = await ctx.db.query.competitions.findFirst({
        where: (table) => eq(table.id, input.competitionId),
        with: {
          competitionsToCubeTypes: {
            with: {
              cubeType: true,
            },
          },
        },
      })

      if (!competition) {
        throw new Error('Тэмцээн олдсонгүй.')
      }

      const allRounds = await ctx.db.query.rounds.findMany({
        where: (table) => and(eq(table.competitionId, competition.id)),
      })
      const allAgeGroups = await ctx.db.query.ageGroups.findMany({
        where: (table) => eq(table.competitionId, input.competitionId),
      })

      const insertMedals: (typeof medals.$inferInsert)[] = []
      const insertAgegroupMedals: (typeof ageGroupMedals.$inferInsert)[] = []
      const finalCompetitorIds = new Set<number>()

      // Helper to get final round for a cube type
      const getFinalRound = (cubeTypeId: number) =>
        allRounds.find((r) => r.isFinal === true && r.cubeTypeId === cubeTypeId)

      // Helper to get age group round for a cube type
      const getAgeGroupRound = (cubeTypeId: number) =>
        allRounds.find((r) => r.isAgeGroup && r.cubeTypeId === cubeTypeId)

      // Final medals
      for (const cubeType of competition.competitionsToCubeTypes) {
        const finalRound = getFinalRound(cubeType.cubeTypeId)
        if (!finalRound) {
          throw new Error(
            `${cubeType.cubeType.name} төрөл дээр финал раунд олдсонгүй.`,
          )
        }

        const finalResults = await ctx.db.query.results.findMany({
          where: (table) =>
            and(
              eq(table.competitionId, input.competitionId),
              eq(table.roundId, finalRound.id),
              gt(table.average, 0),
            ),
          limit: 3,
          orderBy: (table) => [table.average, table.best],
          with: {
            competitor: {
              columns: {
                userId: true,
              },
            },
          },
        })

        insertMedals.push(
          ...finalResults.map((r, i): typeof medals.$inferInsert => ({
            userId: r.competitor.userId,
            competitionId: r.competitionId,
            cubeTypeId: r.cubeTypeId,
            roundId: r.roundId,
            group: '',
            medal: i + 1,
          })),
        )
        finalResults.forEach((r) => finalCompetitorIds.add(r.competitorId))
      }

      // AgeGroup medals
      for (const cubeType of competition.competitionsToCubeTypes.filter((ct) =>
        [2, 6, 9, 13, 14].includes(ct.cubeTypeId),
      )) {
        const ageGroupRound = getAgeGroupRound(cubeType.cubeTypeId)
        if (!ageGroupRound) {
          throw new Error(
            `${cubeType.cubeType.name} төрөл дээр насны ангилал раунд олдсонгүй.`,
          )
        }

        const currentAgeGroups = allAgeGroups.filter(
          (i) => i.cubeTypeId === cubeType.cubeTypeId,
        )

        for (const ageGroup of currentAgeGroups) {
          const currentAgeGroupCompetitors = await ctx.db
            .select({
              id: competitors.id,
            })
            .from(competitors)
            .innerJoin(users, eq(users.id, competitors.userId))
            .where(
              and(
                eq(competitors.competitionId, input.competitionId),
                gte(
                  sql`(extract(year from ${users.birthDate}))`,
                  ageGroup.start,
                ),
                lte(
                  sql`(extract(year from ${users.birthDate}))`,
                  ageGroup.end ?? 0,
                ).if(ageGroup.id),
              ),
            )

          const ageGroupResults = await ctx.db.query.results.findMany({
            where: (table) =>
              and(
                eq(table.competitionId, input.competitionId),
                eq(table.roundId, ageGroupRound.id),
                gt(table.average, 0),
                notInArray(table.competitorId, Array.from(finalCompetitorIds)),
                inArray(
                  table.competitorId,
                  currentAgeGroupCompetitors.map((c) => c.id),
                ),
              ),
            limit: 3,
            orderBy: (table) => [table.average, table.best],
            with: {
              competitor: {
                columns: {
                  userId: true,
                },
              },
            },
          })

          insertAgegroupMedals.push(
            ...ageGroupResults.map(
              (r, i): typeof ageGroupMedals.$inferInsert => ({
                userId: r.competitor.userId,
                competitionId: r.competitionId,
                cubeTypeId: r.cubeTypeId,
                roundId: r.roundId,
                group: '',
                medal: i + 1,
                ageGroupId: ageGroup.id,
              }),
            ),
          )
        }
      }

      // Single transaction for all inserts/deletes
      await ctx.db.transaction(async (db) => {
        if (insertMedals.length > 0) {
          await db
            .delete(medals)
            .where(eq(medals.competitionId, input.competitionId))
          await db.insert(medals).values(insertMedals)
        }
        if (insertAgegroupMedals.length > 0) {
          await db
            .delete(ageGroupMedals)
            .where(eq(ageGroupMedals.competitionId, input.competitionId))
          await db.insert(ageGroupMedals).values(insertAgegroupMedals)
        }
      })
    }),
})
