import { NextApiRequest, NextApiResponse } from "next";
import { Qpay } from "~/utils/qpay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return;

  const query = req.query;
  const id = query.id?.toString();

  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  console.log("requested", id);

  try {
    const result = await Qpay.checkInvoice(id);

    console.log(result);

    return res.status(200).json("SUCCESS");
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
