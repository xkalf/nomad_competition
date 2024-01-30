import { registerSchema } from "~/utils/zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { genSalt, hash } from "bcrypt";
import { users } from "~/server/db/schema";
import { randomUUID } from "crypto";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const salt = await genSalt(10);
      const hashed = await hash(input.password, salt);

      await ctx.db.insert(users).values({
        ...input,
        password: hashed,
        id: randomUUID(),
      });
    }),
});
