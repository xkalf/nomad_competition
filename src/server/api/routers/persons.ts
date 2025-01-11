import { and, eq, exists, gt, min } from 'drizzle-orm'
import { competitors, cubeTypes, results } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const personsRouter = createTRPCRouter({
  getPersonalRecords: protectedProcedure.query(async ({ ctx }) => {
    const competitorsSql = ctx.db
      .select({
        id: competitors.id,
      })
      .from(competitors)
      .where(
        and(
          eq(competitors.userId, ctx.session.user.id),
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
})
