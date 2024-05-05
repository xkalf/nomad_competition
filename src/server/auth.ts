import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { createTable } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      firstname: string;
      lastname: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    firstname: string;
    lastname: string;
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
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...(token.user as any),
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }

      return token;
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
      name: "Credentials",
      credentials: {
        email: { label: "И-Мэйл хаяг", type: "email" },
        password: { label: "Нууц үг", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await db.query.users.findFirst({
          where: (t, { eq }) =>
            eq(t.email, credentials?.email.trim().toLowerCase()),
        });

        if (!user) return null;

        const ok = await compare(credentials.password, user.password);

        return ok ? user : null;
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
