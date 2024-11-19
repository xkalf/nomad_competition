import { CreateInvoiceRequestInput, Qpay, Token } from "mn-payment";
import { env } from "~/env";
import { payments } from "~/server/db/schema";

export const qpay = new Qpay(
  env.QPAY_USERNAME,
  env.QPAY_PASSWORD,
  env.QPAY_INVOICE_CODE,
);

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
    : undefined;

export const mapPayment = (
  input: Token,
): Partial<typeof payments.$inferInsert> => ({
  accessToken: input.access_token,
  refreshToken: input.refresh_token,
  accessExpiresAt: new Date(input.expires_in * 1000),
  refreshExpiresAt: new Date(input.refresh_expires_in * 1000),
});

export const mapQpayInvoice = (invoice: {
  user: {
    phone: number;
  };
  competition: {
    name: string;
  };
  id: number;
  userId: string;
  amount: string;
  competitorId: number;
  invoiceCode: string | null;
  isPaid: boolean;
}): CreateInvoiceRequestInput => ({
  sender_invoice_no: invoice.id.toString(),
  invoice_receiver_code: invoice.userId.toString(),
  invoice_description: `${invoice.user.phone} ${invoice.competition.name} тэмцээний төлбөр`,
  amount: +invoice.amount,
  callback_url: `https://competition.nomad-team.com/api/qpay/${invoice.id}`,
});
