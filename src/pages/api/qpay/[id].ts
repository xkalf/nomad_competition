import { NextApiRequest, NextApiResponse } from "next";
import { Qpay } from "~/utils/qpay";

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

  try {
    await Qpay.checkInvoice(id, paymentId);

    return res.status(200).json("SUCCESS");
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
