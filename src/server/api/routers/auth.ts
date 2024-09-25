import { registerSchema } from '~/utils/zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { genSalt, hash } from 'bcrypt'
import { users, verificationTokens } from '~/server/db/schema'
import { randomUUID } from 'crypto'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { generateVerifictionToken } from '~/server/auth'

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const salt = await genSalt(10)
      const hashed = await hash(input.password, salt)

      await ctx.db.transaction(async (db) => {
        await db.insert(users).values({
          ...input,
          password: hashed,
          id: randomUUID(),
        })

        await generateVerifictionToken(input.email, db)
      })
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user
  }),
  verify: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const token = await ctx.db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, input),
    })

    if (!token || token.expires < new Date()) {
      throw new Error('Хугацаа нь дууссан токен байна. дахин оролдоно уу.')
    }

    await ctx.db
      .update(users)
      .set({ emailVerified: sql`now()` })
      .where(eq(users.email, token.identifier))

    return { success: true }
  }),
  resendVerify: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.token, input),
      })

      if (!token) {
        throw new Error('Амжилтгүй боллоо. Дахин оролдoно уу.')
      }

      await generateVerifictionToken(token.identifier, ctx.db)
      return {
        success: true,
      }
    }),
})
