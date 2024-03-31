import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { createScheduleSchema, getUpdateSchema } from "~/utils/zod";
import { schedules } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const schedulesRouter = createTRPCRouter({
  getByCompetitionId: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.schedules.findMany({
        where: (t, { eq }) => eq(t.competitionId, input),
        orderBy: (t) => [t.date, t.startTime],
      });

      return res;
    }),
  create: adminProcedure
    .input(createScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(schedules).values(input);
    }),
  update: adminProcedure
    .input(getUpdateSchema(createScheduleSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schedules)
        .set(input)
        .where(eq(schedules.id, input.id));
    }),
  delete: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(schedules).where(eq(schedules.id, input));
  }),
});
