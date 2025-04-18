import { z } from 'zod'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc'
import {
  ageGroupMedals,
  medals,
  rankAverage,
  rankSingle,
  rounds,
} from '~/server/db/schema'
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'
import {
  createRoundManySchema,
  createRoundSchema,
  getUpdateSchema,
} from '~/utils/zod'

export const roundsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        cubeTypeId: z.number().int().positive().optional(),
        id: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.rounds.findMany({
        where: and(
          eq(rounds.competitionId, input.competitionId),
          eq(rounds.cubeTypeId, input.cubeTypeId ?? 0).if(input.cubeTypeId),
          eq(rounds.id, input.id ?? 0).if(input.id),
        ),
        with: {
          cubeType: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      })

      return res
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
      })

      return res
    }),
  createMany: adminProcedure
    .input(createRoundManySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        const filtered = input.data
          .map((i) => i.id)
          .filter((i): i is NonNullable<typeof i> => !!i)
          .flat()

        let current: { id: number; cubeTypeId: number }[] = []

        if (filtered.length > 0) {
          current = await db
            .select({
              id: rounds.id,
              cubeTypeId: rounds.cubeTypeId,
            })
            .from(rounds)
            .where(inArray(rounds.id, filtered))
        }

        const insertValues: (typeof rounds.$inferInsert)[] = []
        const founds: number[] = []

        for (const i of input.data) {
          const found = current.filter((c) => i.id?.includes(c.id))
          const { id: _, ...rest } = i

          if (found.length === 0) {
            insertValues.push(
              ...i.cubeTypes.map((j) => {
                return {
                  ...rest,
                  cubeTypeId: j,
                  competitionId: input.competitionId,
                }
              }),
            )
          }

          for (const f of found) {
            founds.push(f.id)
            await db.update(rounds).set(rest).where(eq(rounds.id, f.id))
            if (i.cubeTypes.length > 1) {
              insertValues.push(
                ...i.cubeTypes
                  .filter((j) => f.cubeTypeId !== j)
                  .map((j) => {
                    return {
                      ...rest,
                      cubeTypeId: j,
                      competitionId: input.competitionId,
                    }
                  }),
              )
            }
          }
        }

        if (founds.length > 0) {
          await db
            .delete(rounds)
            .where(
              and(
                notInArray(rounds.id, founds),
                eq(rounds.competitionId, input.competitionId),
              ),
            )
        }
        if (insertValues.length > 0)
          await db.insert(rounds).values(insertValues).onConflictDoNothing()
      })
    }),
  create: adminProcedure
    .input(createRoundSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rounds).values(input)
    }),
  update: adminProcedure
    .input(getUpdateSchema(createRoundSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(rounds).set(input).where(eq(rounds.id, input.id))
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(rounds).where(eq(rounds.id, input))
    }),
  lock: adminProcedure
    .input(
      z.object({
        roundId: z.number().int().positive(),
        isAgeGroupMedal: z.boolean().default(false),
        isMainMedal: z.boolean().default(false),
        nextRoundId: z
          .number()
          .int()
          .nonnegative()
          .default(0)
          .transform((value) => (value === 0 ? undefined : value)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const _results = await ctx.db.query.results.findMany({
        where: (t, { eq }) => eq(t.roundId, input.roundId),
        orderBy: (t) => [t.average],
        with: {
          competitor: {
            columns: {
              userId: true,
              ageGroupId: true,
              provinceId: true,
              districtId: true,
            },
            with: {
              user: {
                columns: {
                  isMale: true,
                },
              },
            },
          },
        },
      })

      await ctx.db.transaction(async (db) => {
        if (input.isMainMedal && _results.length > 0) {
          await db
            .delete(medals)
            .where(eq(medals.competitionId, _results[0]?.competitionId ?? 0))

          await db.insert(medals).values(
            _results.slice(0, 3).map((i, index) => ({
              userId: i.competitor.userId,
              competitionId: i.competitionId,
              cubeTypeId: i.cubeTypeId,
              roundId: i.roundId,
              group: i.group,
              resultId: i.id,
              medal: index + 1,
            })),
          )
        }

        if (input.isAgeGroupMedal) {
          await db
            .delete(ageGroupMedals)
            .where(
              eq(ageGroupMedals.competitionId, _results[0]?.competitionId ?? 0),
            )
          const keys = Array.from(
            new Set(_results.map((r) => r.competitor.ageGroupId)),
          ).filter((i): i is number => !!i)

          for (const key of keys) {
            const values =
              _results
                .filter((r) => r.competitor.ageGroupId === key)
                .sort((a, b) => {
                  if (a.average === -1 || a.average === null) return 1
                  if (b.average === -1 || b.average === null) return -1

                  return (a.average as number) - (b.average as number)
                }) ?? []

            const filtered =
              values.filter((i) => i.average && i.average > 0).length > 0

            if (filtered) {
              await db.insert(ageGroupMedals).values(
                values.slice(0, 3).map((i, index) => ({
                  userId: i.competitor.userId,
                  competitionId: i.competitionId,
                  cubeTypeId: i.cubeTypeId,
                  roundId: i.roundId,
                  group: i.group,
                  ageGroupId: key,
                  medal: index + 1,
                })),
              )
            }
          }
        }

        const currAverage = await db.query.rankAverage.findMany({
          where: (t, { inArray, and, eq }) =>
            and(
              inArray(
                t.userId,
                _results.map((i) => i.competitor.userId),
              ),
              eq(t.cubeTypeId, _results[0]?.cubeTypeId ?? 0),
            ),
        })

        const currSingle = await db.query.rankSingle.findMany({
          where: (t, { inArray, and, eq }) =>
            and(
              inArray(
                t.userId,
                _results.map((i) => i.competitor.userId),
              ),
              eq(t.cubeTypeId, _results[0]?.cubeTypeId ?? 0),
            ),
        })

        for (const result of _results) {
          const avg = currAverage.find(
            (i) => i.userId === result.competitor.userId,
          )
          const single = currSingle.find(
            (i) => i.userId === result.competitor.userId,
          )

          if (
            avg &&
            result.average &&
            result.average > 0 &&
            result.average < avg.value
          ) {
            await db
              .update(rankAverage)
              .set({
                value: result.average,
                roundId: result.roundId,
                resultId: result.id,
                allRank: -1,
                districtRank: -1,
                provinceRank: -1,
                provinceId: result.competitor.provinceId ?? '',
                districtId: result.competitor.districtId ?? '',
              })
              .where(
                and(
                  eq(rankAverage.userId, result.competitor.userId),
                  eq(rankAverage.cubeTypeId, result.cubeTypeId),
                ),
              )
          } else if (!avg && result.average && result.average > 0) {
            await db.insert(rankAverage).values({
              value: result.average,
              userId: result.competitor.userId,
              provinceId: result.competitor.provinceId ?? '',
              districtId: result.competitor.districtId ?? '',
              cubeTypeId: result.cubeTypeId,
              roundId: result.roundId,
              resultId: result.id,
              allRank: -1,
              districtRank: -1,
              provinceRank: -1,
            })
          }

          if (
            single &&
            result.best &&
            result.best > 0 &&
            result.best < single.value
          ) {
            await db
              .update(rankSingle)
              .set({
                value: result.best,
                roundId: result.roundId,
                resultId: result.id,
                allRank: -1,
                districtRank: -1,
                provinceRank: -1,
                provinceId: result.competitor.provinceId ?? '',
                districtId: result.competitor.districtId ?? '',
              })
              .where(
                and(
                  eq(rankSingle.userId, result.competitor.userId),
                  eq(rankSingle.cubeTypeId, result.cubeTypeId),
                ),
              )
          } else if (!single && result.best && result.best > 0) {
            await db.insert(rankSingle).values({
              value: result.best,
              userId: result.competitor.userId,
              cubeTypeId: result.cubeTypeId,
              roundId: result.roundId,
              resultId: result.id,
              allRank: -1,
              districtRank: -1,
              provinceRank: -1,
              provinceId: result.competitor.provinceId ?? '',
              districtId: result.competitor.districtId ?? '',
            })
          }
        }

        const rankedAverage = db.$with('ranked_average').as(
          db
            .select({
              id: rankAverage.id,
              value: rankAverage.value,
              allRank:
                sql<number>`row_number() over (partition by ${rankAverage.cubeTypeId} order by ${rankAverage.value})`.as(
                  'c_all_rank',
                ),
              provinceRank:
                sql<number>`row_number() over (partition by ${rankAverage.cubeTypeId}, ${rankAverage.provinceId} order by ${rankAverage.value})`.as(
                  'c_province_rank',
                ),
              districtRank:
                sql<number>`row_number() over (partition by ${rankAverage.cubeTypeId}, ${rankAverage.districtId} order by ${rankAverage.value})`.as(
                  'c_district_rank',
                ),
            })
            .from(rankAverage),
        )

        const updateRankedAverageQuery = db
          .with(rankedAverage)
          .update(rankAverage)
          .set({
            allRank: sql`${rankedAverage.allRank}`,
            provinceRank: sql`${rankedAverage.provinceRank}`,
            districtRank: sql`${rankedAverage.districtRank}`,
          })
          .from(rankedAverage)
          .where(eq(rankedAverage.id, rankAverage.id))

        await updateRankedAverageQuery

        const rankedSingle = db.$with('ranked_single').as(
          db
            .select({
              id: rankSingle.id,
              value: rankSingle.value,
              allRank:
                sql<number>`row_number() over (partition by ${rankSingle.cubeTypeId} order by ${rankSingle.value})`.as(
                  's_all_rank',
                ),
              provinceRank:
                sql<number>`row_number() over (partition by ${rankSingle.cubeTypeId}, ${rankSingle.provinceId} order by ${rankSingle.value})`.as(
                  's_province_rank',
                ),
              districtRank:
                sql<number>`row_number() over (partition by ${rankSingle.cubeTypeId}, ${rankSingle.districtId} order by ${rankSingle.value})`.as(
                  's_district_rank',
                ),
            })
            .from(rankSingle),
        )

        await db
          .with(rankedSingle)
          .update(rankSingle)
          .set({
            allRank: sql`${rankedSingle.allRank}`,
            provinceRank: sql`${rankedSingle.provinceRank}`,
            districtRank: sql`${rankedSingle.districtRank}`,
          })
          .from(rankedSingle)
          .where(eq(rankedSingle.id, rankSingle.id))
        await db
          .update(rounds)
          .set({ isActive: false })
          .where(eq(rounds.id, input.roundId))
      })
    }),
})
