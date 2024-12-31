import { createResultSchema } from "~/utils/zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { getAverage, getBest } from "~/server/utils/calculate";
import {
  ageGroups,
  competitors,
  competitorsToCubeTypes,
  cubeTypes,
  results,
  rounds,
  schools,
  users,
} from "~/server/db/schema";
import { z } from "zod";
import {
  and,
  eq,
  exists,
  getTableColumns,
  gte,
  isNotNull,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { jsonBuildObject } from "~/server/utils/drizzle.helper";

export const resultsRouter = createTRPCRouter({
  findByRound: publicProcedure
    .input(
      z
        .object({
          roundId: z.number().int().positive(),
          isOther: z.boolean().default(false),
          ageGroupId: z.number().int().positive().optional(),
          verifiedId: z.number().int().positive().optional(),
          isSolved: z.boolean().optional(),
        })
        .merge(createSelectSchema(schools).omit({ id: true }).partial()),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .select({
          ...getTableColumns(results),
          competitor: {
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
            eq(schools.province, input.province ?? "").if(
              !!input.province && input.isOther === false,
            ),
            eq(schools.district, input.district ?? "").if(
              !!input.district && input.isOther === false,
            ),
            eq(schools.school, input.school ?? "").if(
              !!input.school && input.isOther === false,
            ),
            ne(schools.province, input.province ?? "").if(
              !!input.province && input.isOther === true,
            ),
            ne(schools.district, input.district ?? "").if(
              !!input.district && input.isOther === true,
            ),
            ne(schools.school, input.school ?? "").if(
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
            isNotNull(results.average).if(input.isSolved),
          ),
        )
        .orderBy(
          sql`case when ${results.average} is null then 2 when ${results.average} < 0 then 1 else 0 end`,
          results.average,
          sql`case when ${results.best} is null then 2 when ${results.best} < 0 then 1 else 0 end`,
          results.best,
          competitors.verifiedId,
        )
        .$dynamic();

      if (input.ageGroupId) {
        query = query.leftJoin(
          ageGroups,
          and(
            eq(ageGroups.competitionId, results.competitionId),
            eq(ageGroups.cubeTypeId, results.cubeTypeId),
            eq(ageGroups.id, input.ageGroupId),
          ),
        );
      }

      return await query;
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
      ].map((i) => (typeof i === "number" ? i : -1));

      const [round] = await ctx.db
        .select({
          competitionId: rounds.competitionId,
          cubeTypeId: rounds.cubeTypeId,
          type: cubeTypes.type,
        })
        .from(rounds)
        .where(eq(rounds.id, input.roundId))
        .leftJoin(cubeTypes, eq(cubeTypes.id, rounds.cubeTypeId));

      if (!round) {
        throw new Error("Раунд олдсонгүй.");
      }

      const [competitor] = await ctx.db
        .select({
          id: competitors.id,
        })
        .from(competitors)
        .where(
          and(
            eq(competitors.verifiedId, input.verifiedId),
            eq(competitors.competitionId, round.competitionId),
          ),
        );

      if (!competitor) {
        throw new Error("Тамирчин олдсонгүй.");
      }

      const best = getBest(solves);
      const average = getAverage(solves, round.type ?? "ao5");

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
        .returning();

      if (!updated) {
        throw new Error("Тамирчин олдсонгүй.");
      }
    }),
  generate: adminProcedure
    .input(
      /**
       * @input roundId
       */
      z.number().int().positive(),
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
        .leftJoin(cubeTypes, eq(cubeTypes.id, rounds.cubeTypeId));

      if (!round) {
        throw new Error("Раунд олдсонгүй.");
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
                    eq(competitorsToCubeTypes.status, "Paid"),
                  ),
                ),
            ),
          ),
        );

      if (comps.length === 0) {
        throw new Error("Тамирчин хоосон байна.");
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
        );

      if (curr.length > 0) {
        throw new Error("Үзүүлэлт шивсэн байна устгах боломжгүй .");
      }

      await ctx.db
        .delete(results)
        .where(
          and(
            eq(results.roundId, input),
            eq(results.competitionId, round.competitionId),
            eq(results.cubeTypeId, round.cubeTypeId),
          ),
        );

      await ctx.db.insert(results).values(
        comps.map((comp, index): typeof results.$inferInsert => ({
          roundId: input,
          cubeTypeId: round.cubeTypeId,
          competitionId: round.competitionId,
          competitorId: comp.id,
          type: round.type ?? "ao5",
          createdUserId: ctx.session.user.id,
          updatedUserId: ctx.session.user.id,
          group: `${Math.floor(index / round.perGroupCount) + 1}`,
        })),
      );
    }),
});
