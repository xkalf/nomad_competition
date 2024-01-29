import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { competitions } from "~/server/db/schema";

const insertSchema = createInsertSchema(competitions);
const updateSchema = insertSchema.partial().extend({
  id: z.number().int().positive(),
});

export const competitionRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.competitions.findMany();
  }),
  getById: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.competitions.findFirst({
        where: eq(competitions.id, input),
      });

      if (!res) {
        throw new Error("Тэмцээн олдсонгүй.");
      }

      return res;
    }),
  create: adminProcedure
    .input(createInsertSchema(competitions))
    .mutation(async ({ ctx, input }) => {
      const [res] = await ctx.db.insert(competitions).values(input).returning();

      return res;
    }),
  update: adminProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const [res] = await ctx.db
        .update(competitions)
        .set(input)
        .where(eq(competitions.id, input.id))
        .returning();

      if (!res) {
        throw new Error("Тэмцээн олдсонгүй.");
      }

      return res;
    }),
  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      const [res] = await ctx.db
        .delete(competitions)
        .where(eq(competitions.id, input))
        .returning();

      if (!res) {
        throw new Error("Тэмцээн олдсонгүй.");
      }

      return res;
    }),
});
