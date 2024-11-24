import { and, eq, inArray, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '~/server/db'
import {
  competitors,
  competitorsToCubeTypes,
  invoices,
  payments,
} from '~/server/db/schema'
import { mapPayment, mapQpayToken, qpay } from '~/utils/qpay'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return

  const query = req.query
  const id = query.id?.toString()

  if (!id) {
    return res.status(400).json({ error: 'id is required' })
  }

  const invoice = await db.query.invoices.findFirst({
    where: (t, { eq }) => eq(t.id, +id),
  })

  if (!invoice || !invoice.invoiceCode) {
    return res.status(404).json({
      error: {
        message: 'Нэхэмжлэл олдсонгүй.',
      },
    })
  }

  const payment = await db.query.payments.findFirst({
    where: (t, { eq }) => eq(t.type, 'qpay'),
  })

  const token = mapQpayToken(payment)

  try {
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

      if (result.data.paid_amount === +invoice.amount) {
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
      }
    })

    return res.status(200).json('SUCCESS')
  } catch (err) {
    return res.status(500).json({ error: err })
  }
}
