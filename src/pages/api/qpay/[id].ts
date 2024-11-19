import { and, eq, inArray } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { competitorsToCubeTypes, invoices, payments } from "~/server/db/schema";
import { mapPayment, mapQpayToken, qpay } from "~/utils/qpay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return;

  const query = req.query;
  const id = query.id?.toString();
  const paymentId = query.qpay_payment_id?.toString();

  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  if (!paymentId) {
    return res.status(400).json({ error: "qpay_payment_id is required" });
  }

  const invoice = await db.query.invoices.findFirst({
    where: (t, { eq }) => eq(t.id, +id),
  });

  if (!invoice) {
    return res.status(500).json({
      error: {
        message: "Нэхэмжлэл олдсонгүй.",
      },
    });
  }

  const payment = await db.query.payments.findFirst({
    where: (t, { eq }) => eq(t.type, "qpay"),
  });

  const token = mapQpayToken(payment);

  try {
    const result = await qpay.checkInvoice(invoice.invoiceCode ?? "", token);

    if (token !== result.token) {
      await db
        .update(payments)
        .set(mapPayment(result.token))
        .where(eq(payments.type, "qpay"));
    }

    if (result.data.paid_amount === +invoice.amount) {
      await db
        .update(invoices)
        .set({
          isPaid: true,
        })
        .where(eq(invoices.id, +id));

      await db
        .update(competitorsToCubeTypes)
        .set({
          status: "Paid",
        })
        .where(
          and(
            eq(competitorsToCubeTypes.competitorId, invoice.competitorId),
            inArray(
              competitorsToCubeTypes.cubeTypeId,
              invoice.cubeTypeIds ?? [],
            ),
          ),
        );
    }

    return res.status(200).json("SUCCESS");
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
