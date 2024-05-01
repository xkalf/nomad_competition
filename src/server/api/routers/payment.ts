import { createInvoiceSchema } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { QpayService } from "~/server/utils/qpay.service";
import { env } from "~/env";

const Qpay = new QpayService(
  env.QPAY_USERNAME,
  env.QPAY_PASSWORD,
  env.QPAY_INVOICE_CODE,
);

export const paymentsRouter = createTRPCRouter({
  createInvoice: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input }) => {
      const res = await Qpay.createInvoice(input);
      return res;
    }),
});
