import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  competitions,
  competitionsToCubeType,
  competitors,
  competitorsToCubeTypes,
} from "~/server/db/schema";
import {
  competitionRegisterSchema,
  createCompetitionSchema,
  getUpdateSchema,
} from "~/utils/zod";

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
      });
    }),
  getById: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitions.findFirst({
        where: eq(competitions.id, input),
        with: {
          competitionsToCubeTypes: {
            with: {
              cubeType: true,
            },
          },
        },
      });

      if (!res) {
        throw new Error("Тэмцээн олдсонгүй.");
      }

      return res;
    }),
  create: adminProcedure
    .input(createCompetitionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (t) => {
        const [res] = await t.insert(competitions).values(input).returning();

        if (!res) {
          throw new Error("Тэмцээн үүсгэхэд алдаа гарлаа.");
        }

        await t.insert(competitionsToCubeType).values(
          input.cubeTypes.map((cubeType) => ({
            competitionId: res.id,
            cubeTypeId: cubeType,
          })),
        );

        return res;
      });
    }),
  update: adminProcedure
    .input(getUpdateSchema(createCompetitionSchema))
    .mutation(async ({ ctx, input: { cubeTypes, ...input } }) => {
      await ctx.db.transaction(async (t) => {
        await t
          .update(competitions)
          .set(input)
          .where(eq(competitions.id, input.id));

        const currentCubeTypes = await t.query.competitionsToCubeType.findMany({
          where: (table, { eq }) => eq(table.competitionId, input.id),
        });

        const toDelete = currentCubeTypes
          .filter((i) => !cubeTypes?.includes(i.cubeTypeId))
          .map((i) => i.cubeTypeId);
        const toInsert = cubeTypes?.filter(
          (i) => !currentCubeTypes.map((j) => j.cubeTypeId).includes(i),
        );

        if (toDelete.length > 0)
          await t
            .delete(competitionsToCubeType)
            .where(inArray(competitionsToCubeType, toDelete));
        if (toInsert && toInsert?.length > 0) {
          await t.insert(competitionsToCubeType).values(
            toInsert.map((cubeType) => ({
              competitionId: input.id,
              cubeTypeId: cubeType,
            })),
          );
        }
      });
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(competitions)
        .where(eq(competitions.id, input))
        .returning();
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
          .returning();

        if (!res) {
          throw new Error("Тэмцээнд бүртгэл үүсгэхэд алдаа гарлаа.");
        }

        await t.insert(competitorsToCubeTypes).values(
          cubeTypes.map((i) => ({
            competitorId: res.id,
            cubeTypeId: i,
          })),
        );
      }),
    ),
  updateRegister: protectedProcedure
    .input(getUpdateSchema(competitionRegisterSchema))
    .mutation(async ({ ctx, input: { cubeTypes, ...input } }) => {
      await ctx.db.transaction(async (t) => {
        await t
          .update(competitors)
          .set(input)
          .where(eq(competitors.id, input.id));

        const currentCubeTypes = await t.query.competitorsToCubeTypes.findMany({
          where: (table, { eq }) => eq(table.competitorId, input.id),
        });

        const toDelete = currentCubeTypes
          .filter((i) => !cubeTypes?.includes(i.cubeTypeId))
          .map((i) => i.cubeTypeId);
        const toInsert = cubeTypes?.filter(
          (i) => !currentCubeTypes.map((j) => j.cubeTypeId).includes(i),
        );

        if (toDelete.length > 0)
          await t
            .delete(competitorsToCubeTypes)
            .where(inArray(competitorsToCubeTypes, toDelete));
        if (toInsert && toInsert?.length > 0)
          await t.insert(competitorsToCubeTypes).values(
            toInsert.map((cubeType) => ({
              cubeTypeId: cubeType,
              competitorId: input.id,
            })),
          );
      });
    }),
  getRegisterByCompetitionId: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitors.findFirst({
        where: (t, { eq, and }) =>
          and(eq(t.competitionId, input), eq(t.userId, ctx.session.user.id)),
        with: {
          competitorsToCubeTypes: true,
        },
      });

      return res || null;
    }),
});
