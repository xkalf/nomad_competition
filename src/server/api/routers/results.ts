import { createResultSchema } from "~/utils/zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { getAverage, getBest } from "~/server/utils/calculate";
import { results } from "~/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const resultsRouter = createTRPCRouter({
  create: adminProcedure
    .input(createResultSchema)
    .mutation(async ({ ctx, input }) => {
      const solves = [
        input.solve1,
        input.solve2,
        input.solve3,
        input.solve4,
        input.solve5,
      ].filter((i): i is number => typeof i === "number");

      const best = getBest(solves);
      const average = getAverage(solves, input.type);

      await ctx.db.insert(results).values({
        ...input,
        average,
        best,
        createdUserId: ctx.session.user.id,
        updatedUserId: ctx.session.user.id,
      });
    }),
  update: adminProcedure
    .input(
      createResultSchema.extend({
        id: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const solves = [
        input.solve1,
        input.solve2,
        input.solve3,
        input.solve4,
        input.solve5,
      ].filter((i): i is number => typeof i === "number");

      const best = getBest(solves);
      const average = getAverage(solves, input.type);

      await ctx.db
        .update(results)
        .set({
          ...input,
          average,
          best,
          updatedUserId: ctx.session.user.id,
        })
        .where(eq(results.id, input.id));
    }),
});
