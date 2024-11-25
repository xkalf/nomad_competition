import { and, eq, inArray, sql } from 'drizzle-orm'
import { CreateInvoiceRequestInput, Qpay, Token } from 'mn-payment'
import { env } from '~/env'
import { DB } from '~/server/db'
import {
  competitors,
  competitorsToCubeTypes,
  invoices,
  payments,
} from '~/server/db/schema'

export const qpay = new Qpay(
  env.QPAY_USERNAME,
  env.QPAY_PASSWORD,
  env.QPAY_INVOICE_CODE,
)

export const mapQpayToken = (
  input?: typeof payments.$inferSelect,
): Token | undefined =>
  input
    ? {
      access_token: input.accessToken,
      refresh_token: input.refreshToken,
      refresh_expires_in: input.refreshExpiresAt.getMilliseconds(),
      expires_in: input.accessExpiresAt.getMilliseconds(),
    }
    : undefined

export const mapPayment = (
  input: Token,
): Partial<typeof payments.$inferInsert> => ({
  accessToken: input.access_token,
  refreshToken: input.refresh_token,
  accessExpiresAt: new Date(input.expires_in * 1000),
  refreshExpiresAt: new Date(input.refresh_expires_in * 1000),
})

export const mapQpayInvoice = (invoice: {
  user: {
    phone: number
  }
  competition: {
    name: string
  }
  id: number
  userId: string
  amount: string
  competitorId: number
  invoiceCode: string | null
  isPaid: boolean
}): CreateInvoiceRequestInput => ({
  sender_invoice_no: invoice.id.toString(),
  invoice_receiver_code: invoice.userId.toString(),
  invoice_description: `${invoice.user.phone} ${invoice.competition.name} тэмцээний төлбөр`,
  amount: +invoice.amount,
  callback_url: `https://competition.nomad-team.com/api/qpay/${invoice.id}`,
})

export async function checkInvoice(id: number, db: DB) {
  const invoice = await db.query.invoices.findFirst({
    where: (t, { eq }) => eq(t.id, +id),
  })

  if (!invoice || !invoice.invoiceCode) {
    throw new Error('Нэхэмжлэл олдсонгүй.')
  }

  const payment = await db.query.payments.findFirst({
    where: (t, { eq }) => eq(t.type, 'qpay'),
  })

  const token = mapQpayToken(payment)

  const result = await qpay.checkInvoice(invoice.invoiceCode, token)

  await db.transaction(async (db) => {
    if (token !== result.token) {
      await db
        .update(payments)
        .set(mapPayment(result.token))
        .where(eq(payments.type, 'qpay'))
    }

    await db
      .update(invoices)
      .set({
        paymentResult: result.data,
      })
      .where(eq(invoices.id, +id))

    if (result.data.paid_amount !== +invoice.amount) {
      throw new Error('Үнийн дүн зөрүүтэй байна.')
    }

    await db
      .update(invoices)
      .set({
        isPaid: true,
      })
      .where(eq(invoices.id, +id))

    if (invoice.cubeTypeIds && invoice.cubeTypeIds.length > 0) {
      await db
        .update(competitorsToCubeTypes)
        .set({
          status: 'Paid',
        })
        .where(
          and(
            eq(competitorsToCubeTypes.competitorId, invoice.competitorId),
            inArray(competitorsToCubeTypes.cubeTypeId, invoice.cubeTypeIds),
          ),
        )
    }

    if (invoice.hasCompetitionFee) {
      await db
        .update(competitors)
        .set({
          verifiedAt: sql`now()`,
          status: 'Verified',
        })
        .where(eq(competitors.id, invoice.competitorId))
    }
  })
}
