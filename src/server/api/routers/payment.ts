import { createInvoiceSchema, invoices } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Qpay } from "~/utils/qpay";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const paymentsRouter = createTRPCRouter({
  createInvoice: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input }) => {
      const res = await Qpay.createInvoice(input);
      console.log(res);
      return res;
    }),
  checkInvoice: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      const res = await Qpay.checkInvoice(input);
      console.log(res);
      return res;
    }),
  cronInvoice: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const [res] = await ctx.db
        .select({ isPaid: invoices.isPaid })
        .from(invoices)
        .where(eq(invoices.invoiceCode, input));
      return res?.isPaid;
    }),
});
