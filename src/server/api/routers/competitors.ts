import { and, eq, getTableColumns, max, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  competitors,
  competitorsToCubeTypes,
  districts,
  provinces,
  schools,
  users,
} from '~/server/db/schema'
import { getTotalAmount } from '~/server/utils/getTotalAmount'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../trpc'
import { randomUUID } from 'node:crypto'

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
        where: (t, { and, eq }) =>
          and(
            eq(t.competitionId, input.competitionId),
            eq(t.status, input.isVerified ? 'Verified' : 'Created'),
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
      })

      return res
    }),
  verify: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        const [competition] = await db
          .select({
            id: sql<number>`${max(competitors.verifiedId)}`.as('v_id'),
            competitionId: competitors.competitionId,
          })
          .from(competitors)
          .where(eq(competitors.id, input))
          .groupBy(competitors.competitionId)

        if (!competition) {
          throw new Error('Бүртгэл олдсонгүй.')
        }

        const [res] = await db
          .update(competitors)
          .set({
            verifiedAt: sql`now()`,
            status: 'Verified',
            verifiedId: competition.id ? competition.id + 1 : 1,
          })
          .where(eq(competitors.id, input))
          .returning()

        if (!res) {
          throw new Error('Бүртгэл олдсонгүй.')
        }

        await db
          .update(competitorsToCubeTypes)
          .set({
            status: 'Paid',
          })
          .where(eq(competitorsToCubeTypes.competitorId, input))
      })
    }),
  cancel: adminProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .update(competitors)
          .set({
            status: 'Cancelled',
            verifiedAt: null,
          })
          .where(eq(competitors.id, input))
      })

      await ctx.db
        .update(competitorsToCubeTypes)
        .set({
          status: 'Cancelled',
        })
        .where(eq(competitorsToCubeTypes.competitorId, input))
    }),
  getTotalAmount: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      return await getTotalAmount(input, ctx.db)
    }),
  getProvinces: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        ...getTableColumns(provinces),
      })
      .from(provinces)
      .orderBy(
        sql`case when ${provinces.name} = 'Улаанбаатар' then 0 else 1 end`,
        provinces.name,
      )
  }),
  getDistricts: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(districts)
        .where(eq(districts.provinceId, input))
    }),
  getSchools: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({
          ...getTableColumns(schools),
        })
        .from(schools)
        .where(eq(schools.districtId, input))
        .orderBy(schools.school)

      return res
    }),
  importFromWca: adminProcedure
    .input(
      z.object({
        competitionId: z.number().int().positive(),
        data: z
          .object({
            Email: z.string().email(),
            'WCA ID': z.string().optional(),
            Name: z.string(),
            'Birth Date': z.string().date(),
            'User Id': z.coerce.number().optional(),
            '333': z.string().optional(),
            '444': z.string().optional(),
            '222': z.string().optional(),
            '555': z.string().optional(),
            '333bf': z.string().optional(),
            minx: z.string().optional(),
            pyram: z.string().optional(),
          })
          .array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      for (const user of input.data) {
        let userId = ''
        const [dbUser] = await ctx.db
          .select()
          .from(users)
          .where(eq(users.email, user.Email))

        if (dbUser) {
          userId = dbUser.id
          const firstname = user.Name.split(' ')[0] ?? ''
          const lastname = user.Name.split(' ')[1] ?? ''

          if (dbUser.firstname !== firstname || dbUser.lastname !== lastname) {
            await ctx.db
              .update(users)
              .set({
                firstname,
                lastname,
              })
              .where(eq(users.id, dbUser.id))
          }
        } else {
          const [insertedUser] = await ctx.db
            .insert(users)
            .values({
              email: user.Email,
              wcaId: user['WCA ID'] === 'null' ? undefined : user['WCA ID'],
              firstname: user.Name?.split(' ')?.[0] ?? '',
              lastname: user.Name?.split(' ')?.[1] ?? '',
              phone: 0,
              birthDate: user['Birth Date'],
              password: '',
              emailVerified: sql`now()`,
              id: randomUUID(),
            })
            .returning()

          userId = insertedUser?.id ?? ''
        }

        if (!userId) {
          console.log('COMPETITOR NOT FOUND ', user.Email)
          continue
        }

        let competitorId = 0

        const [competitor] = await ctx.db
          .insert(competitors)
          .values({
            userId: userId,
            competitionId: input.competitionId,
            status: 'Verified',
            guestCount: 0,
            verifiedAt: sql`now()`,
            verifiedId: user['User Id'],
          })
          .returning()
          .onConflictDoNothing()

        if (competitor) {
          competitorId = competitor.id
        } else {
          const curr = await ctx.db.query.competitors.findFirst({
            where: and(
              eq(competitors.userId, userId),
              eq(competitors.competitionId, input.competitionId),
            ),
          })

          if (!curr) {
            continue
          }

          competitorId = curr.id
        }

        if (!competitorId) {
          console.log('COMPETITOR NOT FOUND', user.Email, userId)
        }

        const insert: number[] = []

        if (user['333'] === '1') {
          insert.push(2)
        }
        if (user['222'] === '1') {
          insert.push(6)
        }
        if (user['444'] === '1') {
          insert.push(3)
        }
        if (user['555'] === '1') {
          insert.push(4)
        }
        if (user['333bf'] === '1') {
          insert.push(11)
        }
        if (user.minx === '1') {
          insert.push(8)
        }
        if (user.pyram === '1') {
          insert.push(9)
        }

        if (insert.length > 0) {
          await ctx.db
            .insert(competitorsToCubeTypes)
            .values(
              insert.map((i): typeof competitorsToCubeTypes.$inferInsert => ({
                competitorId: competitorId,
                cubeTypeId: i,
                status: 'Paid',
              })),
            )
            .onConflictDoNothing()
        }

        console.log(user.Email, ' Done')
      }
    }),
})
