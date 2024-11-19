import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { competitors, competitorsToCubeTypes } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getTotalAmount } from "~/server/utils/getTotalAmount";

export const competitorRouter = createTRPCRouter({
  getByCompetitionId: publicProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        isVerified: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitors.findMany({
        where: (t, { isNull, isNotNull, and, eq }) =>
          and(
            eq(t.competitionId, input.competitionId),
            isNotNull(t.verifiedAt).if(input.isVerified),
            isNull(t.verifiedAt).if(!input.isVerified),
          ),
        with: {
          user: {
            columns: {
              firstname: true,
              lastname: true,
              wcaId: true,
              birthDate: true,
            },
          },
          competitorsToCubeTypes: {
            with: {
              cubeType: {
                columns: {
                  name: true,
                },
              },
            },
          },
          invoices: {
            columns: {
              amount: true,
              isPaid: true,
            },
          },
        },
      });

      return res;
    }),
  verify: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .update(competitors)
          .set({
            verifiedAt: sql`now()`,
          })
          .where(eq(competitors.id, input));

        await db
          .update(competitorsToCubeTypes)
          .set({
            status: "Paid",
          })
          .where(eq(competitorsToCubeTypes.competitorId, input));
      });
    }),
  getTotalAmount: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      return await getTotalAmount(input, ctx.db);
    }),
});
