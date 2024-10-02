import { passwordResetSchema, registerSchema } from '~/utils/zod'
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

        await generateVerifictionToken(input.email, 'verify', db)
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
    await ctx.db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, input))

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

      await generateVerifictionToken(token.identifier, 'verify')
      return {
        success: true,
      }
    }),
  passwordReset: publicProcedure
    .input(passwordResetSchema)
    .mutation(async ({ ctx, input }) => {
      const salt = await genSalt(10)
      const hashed = await hash(input.password, salt)

      const [token] = await ctx.db
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.token, input.token))

      if (!token || token.expires < new Date()) {
        throw new Error('Баталгаажуулалт амжилтгүй боллоо. Дахин оролдоно уу.')
      }

      await ctx.db
        .update(users)
        .set({
          password: hashed,
        })
        .where(eq(users.email, token.identifier))
      await ctx.db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, input.token))
    }),
  sendPasswordResetEmail: publicProcedure
    .input(z.string().email())
    .mutation(async ({ input }) => {
      await generateVerifictionToken(input, 'password')
    }),
})
