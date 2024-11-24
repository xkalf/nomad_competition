import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { invoices, payments } from '~/server/db/schema'
import { mapPayment, mapQpayInvoice, mapQpayToken, qpay } from '~/utils/qpay'
import { createInvoiceSchema } from '~/utils/zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getTotalAmount } from '~/server/utils/getTotalAmount'
import { addMinutes, differenceInMinutes, isAfter } from 'date-fns'

export const paymentsRouter = createTRPCRouter({
  createInvoice: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      const lastInvoice = await ctx.db.query.invoices.findFirst({
        where: (t, { eq }) => eq(t.competitorId, input.competitorId),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        columns: {
          createdAt: true,
          isPaid: true,
        },
      })

      if (
        lastInvoice &&
        lastInvoice.isPaid !== true &&
        isAfter(addMinutes(lastInvoice.createdAt, 5), new Date())
      ) {
        throw new Error(
          `Нэхэмжлэл үүссэн байна ${differenceInMinutes(addMinutes(lastInvoice.createdAt, 5), new Date())} минутийн дараа дахин оролдотийн дараа дахин оролдоно уу.`,
        )
      }

      const payment = await ctx.db.query.payments.findFirst({
        where: eq(payments.type, 'qpay'),
      })

      const token = mapQpayToken(payment)

      const totalAmount = await getTotalAmount(input.competitorId, ctx.db)

      const invoice = await ctx.db.transaction(async (db) => {
        const desc = await db.query.competitors.findFirst({
          where: (t, { eq }) => eq(t.id, input.competitorId),
          columns: {
            status: true,
          },
          with: {
            competition: {
              columns: {
                name: true,
              },
            },
            user: {
              columns: {
                phone: true,
              },
            },
            competitorsToCubeTypes: {
              columns: {
                cubeTypeId: true,
                status: true,
              },
            },
          },
        })

        if (!desc) {
          throw new Error('Нэхэмжлэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.')
        }

        if (desc.status === 'Cancelled') {
          throw new Error(
            'Бүртгэл цуцлагдсан байна. Зохион байгуулагчидтай холбогдоно уу.',
          )
        }

        const invoice = (
          await db
            .insert(invoices)
            .values({
              ...input,
              amount: totalAmount.toString(),
              cubeTypeIds: desc.competitorsToCubeTypes
                .filter((i) => i.status === 'Created')
                .map((i) => i.cubeTypeId),
              hasCompetitionFee: desc.status === 'Created',
            })
            .returning()
        )[0]

        if (!invoice) {
          throw new Error('Нэхэмжлэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.')
        }

        return {
          ...invoice,
          ...desc,
        }
      })

      const res = await qpay.createInvoice(mapQpayInvoice(invoice), token)

      if (res.token !== token) {
        await ctx.db
          .update(payments)
          .set(mapPayment(res.token))
          .where(eq(payments.type, 'qpay'))
      }

      await ctx.db
        .update(invoices)
        .set({
          invoiceCode: res.data.invoice_id,
        })
        .where(eq(invoices.id, invoice.id))

      return res.data
    }),
  cronInvoice: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const [res] = await ctx.db
        .select({ isPaid: invoices.isPaid })
        .from(invoices)
        .where(eq(invoices.invoiceCode, input))
      return res?.isPaid
    }),
})
