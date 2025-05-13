import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ageGroups } from '~/server/db/schema'
import {
  createAgeGroupManySchema,
  createAgeGroupSchema,
  getUpdateSchema,
} from '~/utils/zod'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc'

export const ageGroupRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        cubeTypeId: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.ageGroups.findMany({
        where: (t, { eq, and }) =>
          and(
            eq(t.competitionId, input.competitionId),
            eq(t.cubeTypeId, input.cubeTypeId ?? 0).if(!!input.cubeTypeId),
          ),
        with: {
          cubeType: true,
        },
      })

      return res.sort((a, b) => {
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || '0', 10)
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || '0', 10)

        return numA - numB
      })
    }),
  create: adminProcedure
    .input(createAgeGroupSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(ageGroups).values(input)
    }),
  update: adminProcedure
    .input(getUpdateSchema(createAgeGroupSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(ageGroups)
        .set(input)
        .where(eq(ageGroups.id, input.id))
    }),
  createMany: adminProcedure
    .input(createAgeGroupManySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .delete(ageGroups)
          .where(eq(ageGroups.competitionId, input.competitionId))

        const values: (typeof ageGroups.$inferInsert)[] = input.data.flatMap(
          (i) => {
            const cubeTypes = i.cubeTypes

            return cubeTypes.map((ct) => ({
              ...i,
              competitionId: input.competitionId,
              cubeTypeId: ct,
            }))
          },
        )

        await db.insert(ageGroups).values(values)
      })
    }),
  delete: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(ageGroups).where(eq(ageGroups.id, input))
  }),
})
