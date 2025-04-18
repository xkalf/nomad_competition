import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { compare } from 'bcrypt'
import { type GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import { type Adapter } from 'next-auth/adapters'
import Credentials from 'next-auth/providers/credentials'

import { db, DBType } from '~/server/db'
import { createTable, users, verificationTokens } from '~/server/db/schema'
import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { VerifyAccountTemplate } from '~/components/emails/verify-account'
import { ResetPasswordTemplate } from '~/components/emails/reset-password'
import { addHours, isBefore } from 'date-fns'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      isAdmin: boolean
      firstname: string
      lastname: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  interface User {
    isAdmin: boolean
    firstname: string
    lastname: string
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ...(token.user as any),
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user
      }

      return token
    },
  },
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'И-Мэйл хаяг', type: 'email' },
        password: { label: 'Нууц үг', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const user = await db.query.users.findFirst({
          where: (t, { eq }) =>
            eq(t.email, credentials?.email.trim().toLowerCase()),
        })

        if (!user) {
          throw new Error('Мэйл хаяг эсвэл нууц үг буруу байна.')
        }

        const ok = await compare(credentials.password, user.password)

        if (!ok) {
          throw new Error('Мэйл хаяг эсвэл нууц үг буруу байна.')
        }

        if (!user.emailVerified) {
          await generateVerifictionToken(user.email)
          throw new Error(
            'Мэйл хаяг баталгаажаагүй байна. Мэйл хаягаа шалгана уу. Хүчинтэй хугацаа 20 минут',
          )
        }

        return user
      },
    }),
  ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}

const resend = new Resend()

export async function generateVerifictionToken(
  email: string,
  type: 'verify' | 'password' = 'verify',
  d: DBType = db,
) {
  const [curr] = await d
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, email))

  // if token not expired throw error
  if (curr && isBefore(new Date(), curr.expires)) {
    throw new Error('Имэйл илгээгдсэн байна. мэйл хаягаа шалгана уу.')
  }

  await d
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email))

  const [res] = await d
    .insert(verificationTokens)
    .values({
      identifier: email,
      token: randomUUID(),
      expires: addHours(new Date(), 1),
    })
    .returning()

  if (!res) {
    throw new Error('Бүртгэлтэй хэрэглэгч олдсонгүй.')
  }

  const [user] = await d.select().from(users).where(eq(users.email, email))

  if (!user) {
    throw new Error('Бүртгэлтэй хэрэглэгч олдсонгүй.')
  }

  const { error } = await resend.emails.send({
    from: 'info@nomad-team.com',
    to: [res.identifier],
    subject: `Nomad Team ${type === 'verify' ? 'Бүртгэл баталгаажуулалт' : 'Нууц үг сэргээх'}`,
    react:
      type === 'verify'
        ? VerifyAccountTemplate({
            user: user,
            token: res.token,
          })
        : ResetPasswordTemplate({
            user: user,
            token: res.token,
          }),
  })

  if (error) {
    throw new Error(error.message)
  }
}
