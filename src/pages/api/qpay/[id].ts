import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '~/server/db'
import { checkInvoice } from '~/utils/qpay'

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

  try {
    await checkInvoice(+id, db)
  } catch (err) {
    return res.status(500).json({
      error: err,
    })
  }
}
