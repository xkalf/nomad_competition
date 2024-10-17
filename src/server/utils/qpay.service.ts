import { eq, sql } from 'drizzle-orm'
import { db } from '../db'
import {
  competitions,
  competitors,
  invoices,
  payments,
  users,
} from '../db/schema'
import { CreateInvoiceInput } from '~/utils/zod'

type CreateInvoiceRequestInput = {
  invoice_code: string
  sender_invoice_no: string
  invoice_receiver_code: string
  invoice_description: string
  amount: number
  callback_url: string
}

type TokenResponse = {
  token_type: string
  refresh_expires_in: number
  refresh_token: string
  access_token: string
  expires_in: number
  scope: string
  'not-before-policy': string
  session_state: string
}

type InvoiceResponse = {
  invoice_id: string
  qr_text: string
  qr_image: string
  qPay_shortUrl: string
  urls: {
    name: string
    description: string
    logo: string
    link: string
  }[]
}

export class QpayService {
  private username: string
  private password: string
  private invoiceCode: string
  private baseUrl = 'https://merchant.qpay.mn'

  constructor(username: string, password: string, invoiceCode: string) {
    this.username = username
    this.password = password
    this.invoiceCode = invoiceCode
  }

  private async login() {
    const req = await fetch(`${this.baseUrl}/v2/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      },
    })

    const res: TokenResponse = await req.json()

    return res
  }

  private async getRefreshToken(refreshToken: string) {
    const req = await fetch(`${this.baseUrl}/v2/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    const res: TokenResponse = await req.json()

    return res
  }

  private async getPayment() {
    const res = await db.query.payments.findFirst({
      where: eq(payments.type, 'qpay'),
    })

    if (res && res.accessExpiresAt > new Date()) {
      return res
    }

    let tokens

    if (!res) {
      tokens = await this.login()
    } else {
      if (res.refreshExpiresAt <= new Date()) {
        tokens = await this.login()
      } else {
        tokens = await this.getRefreshToken(res.refreshToken)
      }
    }

    if (!tokens) {
      throw new Error('Qpay Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.')
    }

    const newPayment = await db
      .insert(payments)
      .values({
        type: 'qpay',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accessExpiresAt: new Date(tokens.expires_in * 1000),
        refreshExpiresAt: new Date(tokens.refresh_expires_in * 1000),
      })
      .onConflictDoUpdate({
        target: payments.type,
        set: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessExpiresAt: new Date(tokens.expires_in * 1000),
          refreshExpiresAt: new Date(tokens.refresh_expires_in * 1000),
        },
      })
      .returning()

    if (!newPayment[0]) {
      throw new Error('Qpay Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.')
    }

    return newPayment[0]
  }

  async createInvoice(input: CreateInvoiceInput) {
    const payment = await this.getPayment()

    const invoice = (await db.insert(invoices).values(input).returning())[0]

    if (!invoice) {
      throw new Error('Нэхэмжлэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.')
    }

    const desc = (
      await db
        .select({
          phone: users.phone,
          competitionName: competitions.name,
        })
        .from(competitors)
        .leftJoin(users, eq(competitors.userId, users.id))
        .leftJoin(competitions, eq(competitors.competitionId, competitions.id))
        .where(eq(competitors.id, input.competitorId))
    )[0]

    if (!desc) {
      throw new Error('Нэхэмжлэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.')
    }

    const body: CreateInvoiceRequestInput = {
      invoice_code: this.invoiceCode,
      sender_invoice_no: invoice.id.toString(),
      invoice_receiver_code: invoice.userId.toString(),
      invoice_description: `${desc.phone} ${desc.competitionName} тэмцээний төлбөр`,
      amount: +input.amount,
      callback_url: `https://competition.nomad-team.com/api/qpay/${invoice.id}`,
    }

    const req = await fetch(`${this.baseUrl}/v2/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payment.accessToken}`,
      },
      body: JSON.stringify(body),
    })

    const res: InvoiceResponse = await req.json()

    await db
      .update(invoices)
      .set({
        invoiceCode: res.invoice_id,
      })
      .where(eq(invoices.id, invoice.id))

    return res
  }

  async checkInvoice(id: string, paymentId: string) {
    const payment = await this.getPayment()

    const req = await fetch(`${this.baseUrl}/v2/payment/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${payment.accessToken}`,
      },
    })

    const res: { payment_status: string } = await req.json()

    if (res.payment_status === 'PAID') {
      await db.transaction(async (db) => {
        const [res] = await db
          .update(invoices)
          .set({
            isPaid: true,
          })
          .where(eq(invoices.id, +id))
          .returning()

        if (!res) {
          throw new Error('Нэхэмжлэл олдсонгүй')
        }

        await db
          .update(competitors)
          .set({
            verifiedAt: sql`now()`,
          })
          .where(eq(competitors.id, res?.competitorId))
      })
    }

    return res
  }
}
