import { and, count, eq, exists, inArray, sql, sum } from 'drizzle-orm'
import slugify from 'slugify'
import { z } from 'zod'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import {
  competitions,
  competitionsToCubeType,
  competitors,
  competitorsToCubeTypes,
  fees,
  users,
} from '~/server/db/schema'
import { jsonBuildObject } from '~/server/utils/drizzle.helper'
import {
  competitionRegisterSchema,
  createCompetitionSchema,
  getUpdateSchema,
} from '~/utils/zod'

export const competitionRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.boolean().optional())
    .query(({ ctx, input }) => {
      return ctx.db.query.competitions.findMany({
        where: (t, { gte, lte }) =>
          input === true
            ? gte(t.startDate, sql`now()`)
            : input === false
              ? lte(t.startDate, sql`now()`)
              : undefined,
        with: {
          competitionsToCubeTypes: true,
        },
      })
    }),
  getBySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const res = await ctx.db.query.competitions.findFirst({
      where: eq(competitions.slug, input),
      extras: {
        isRegisterAble:
          sql`${competitions.registerStartDate} <= now() AND ${competitions.registerEndDate} >= now() AND ${competitions.maxCompetitors} > (${ctx.db
            .select({
              count: count(),
            })
            .from(competitions)
            .where(eq(competitions.slug, input))})`.as('is_register_able'),
      },
      with: {
        competitionsToCubeTypes: {
          with: {
            cubeType: true,
          },
        },
        fees: {
          with: {
            cubeType: true,
          },
        },
      },
    })

    if (!res) {
      throw new Error('Тэмцээн олдсонгүй.')
    }

    return res
  }),
  getById: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitions.findFirst({
        where: eq(competitions.id, input),
        extras: {
          isRegisterAble:
            sql`${competitions.registerStartDate} <= now() AND ${competitions.registerEndDate} >= now() AND ${competitions.maxCompetitors} > (${ctx.db
              .select({
                count: count(),
              })
              .from(competitions)
              .where(eq(competitions.id, input))})`.as('is_register_able'),
        },
        with: {
          competitionsToCubeTypes: {
            with: {
              cubeType: true,
            },
          },
          fees: {
            with: {
              cubeType: true,
            },
          },
        },
      })

      if (!res) {
        throw new Error('Тэмцээн олдсонгүй.')
      }

      return res
    }),
  create: adminProcedure
    .input(createCompetitionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (t) => {
        const [res] = await t
          .insert(competitions)
          .values({
            ...input,
            slug: slugify(input.name, { lower: true }),
          })
          .returning()

        if (!res) {
          throw new Error('Тэмцээн үүсгэхэд алдаа гарлаа.')
        }

        await t.insert(competitionsToCubeType).values(
          input.cubeTypes.map((cubeType) => ({
            competitionId: res.id,
            cubeTypeId: cubeType,
          })),
        )

        return res
      })
    }),
  update: adminProcedure
    .input(getUpdateSchema(createCompetitionSchema))
    .mutation(async ({ ctx, input: { cubeTypes, ...input } }) => {
      const res = await ctx.db.transaction(async (t) => {
        const [res] = await t
          .update(competitions)
          .set({
            ...input,
            ...(input.name
              ? { slug: slugify(input.name, { lower: true }) }
              : {}),
          })
          .where(eq(competitions.id, input.id))
          .returning()

        if (!res) {
          throw new Error('Тэмцээн олдсонгүй.')
        }

        const currentCubeTypes = await t.query.competitionsToCubeType.findMany({
          where: (table, { eq }) => eq(table.competitionId, input.id),
        })

        const toDelete = currentCubeTypes
          .filter((i) => !cubeTypes?.includes(i.cubeTypeId))
          .map((i) => i.cubeTypeId)
        const toInsert = cubeTypes?.filter(
          (i) => !currentCubeTypes.map((j) => j.cubeTypeId).includes(i),
        )

        if (toDelete.length > 0)
          await t
            .delete(competitionsToCubeType)
            .where(inArray(competitionsToCubeType.cubeTypeId, toDelete))
        if (toInsert && toInsert?.length > 0) {
          await t.insert(competitionsToCubeType).values(
            toInsert.map((cubeType) => ({
              competitionId: input.id,
              cubeTypeId: cubeType,
            })),
          )
        }

        return res
      })

      return res
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(competitions)
        .where(eq(competitions.id, input))
        .returning()
    }),
  register: protectedProcedure
    .input(competitionRegisterSchema)
    .mutation(async ({ ctx, input: { cubeTypes, ...input } }) =>
      ctx.db.transaction(async (t) => {
        const [res] = await t
          .insert(competitors)
          .values({
            ...input,
            userId: ctx.session.user.id,
          })
          .returning()

        if (!res) {
          throw new Error('Тэмцээнд бүртгэл үүсгэхэд алдаа гарлаа.')
        }

        await t.insert(competitorsToCubeTypes).values(
          cubeTypes.map((i) => ({
            competitorId: res.id,
            cubeTypeId: i,
          })),
        )
      }),
    ),
  updateRegister: protectedProcedure
    .input(getUpdateSchema(competitionRegisterSchema))
    .mutation(async ({ ctx, input: { cubeTypes, ...input } }) => {
      await ctx.db.transaction(async (t) => {
        const [res] = await t
          .update(competitors)
          .set(input)
          .where(eq(competitors.id, input.id))
          .returning()

        if (!res) {
          throw new Error('Тэмцээнд бүртгэл үүсгэхэд алдаа гарлаа.')
        }

        const currentCubeTypes = await t.query.competitorsToCubeTypes.findMany({
          where: (table, { eq }) => eq(table.competitorId, input.id),
        })

        const toDelete = currentCubeTypes
          .filter((i) => !cubeTypes?.includes(i.cubeTypeId))
          .map((i) => i.cubeTypeId)
        const toInsert =
          cubeTypes?.filter(
            (i) => !currentCubeTypes.map((j) => j.cubeTypeId).includes(i),
          ) ?? []
        const toPaid = currentCubeTypes
          .filter((i) => i.status === 'Cancelled')
          .filter((i) => cubeTypes?.includes(i.cubeTypeId))
          .map((i) => i.cubeTypeId)

        if (toPaid.length > 0) {
          await t
            .update(competitorsToCubeTypes)
            .set({
              status: 'Paid',
            })
            .where(
              and(
                inArray(competitorsToCubeTypes.cubeTypeId, toPaid),
                eq(competitorsToCubeTypes.competitorId, input.id),
              ),
            )
        }

        if (toDelete.length > 0) {
          const currFees = await t.query.fees.findMany({
            where: (t, { eq, and, inArray }) =>
              and(
                eq(t.competitionId, res?.competitionId),
                inArray(t.cubeTypeId, toDelete),
              ),
          })

          const toDelete2 = toDelete.filter(
            (i) => !currFees.map((j) => j.cubeTypeId).includes(i),
          )

          if (toDelete2.length > 0)
            await t
              .delete(competitorsToCubeTypes)
              .where(
                and(
                  inArray(competitorsToCubeTypes.cubeTypeId, toDelete2),
                  eq(competitorsToCubeTypes.competitorId, input.id),
                ),
              )

          const toUpdate = currFees
            .filter((i) => +i.amount > 0)
            .map((i) => i.cubeTypeId)

          if (toUpdate.length > 0) {
            await t
              .update(competitorsToCubeTypes)
              .set({
                status: 'Cancelled',
              })
              .where(
                and(
                  inArray(competitorsToCubeTypes.cubeTypeId, toUpdate),
                  eq(competitorsToCubeTypes.competitorId, res.id),
                ),
              )
          }
        }

        if (toInsert.length > 0) {
          await t.insert(competitorsToCubeTypes).values(
            toInsert.map((cubeType) => ({
              cubeTypeId: cubeType,
              competitorId: input.id,
            })),
          )
        }
      })
    }),
  getRegisterByCompetitionId: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitors.findFirst({
        where: (t, { eq, and }) =>
          and(eq(t.competitionId, input), eq(t.userId, ctx.session.user.id)),
        with: {
          competitorsToCubeTypes: true,
          invoices: true,
        },
      })

      return res || null
    }),
  getRefunds: adminProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          amount: sum(fees.amount),
          user: jsonBuildObject({
            firstname: users.firstname,
            lastname: users.lastname,
            phone: users.phone,
          }),
        })
        .from(competitorsToCubeTypes)
        .where(
          exists(
            ctx.db
              .select({ id: competitors.id })
              .from(competitors)
              .where(
                and(
                  eq(competitors.competitionId, input),
                  eq(competitors.id, competitorsToCubeTypes.competitorId),
                ),
              ),
          ),
        )
        .leftJoin(
          competitors,
          eq(competitors.id, competitorsToCubeTypes.competitorId),
        )
        .leftJoin(users, eq(users.id, competitors.userId))
        .leftJoin(
          fees,
          and(
            eq(fees.competitionId, input),
            eq(fees.cubeTypeId, competitorsToCubeTypes.cubeTypeId),
          ),
        )
    }),
})
