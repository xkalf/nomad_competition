import { QpayService } from "~/server/utils/qpay.service";
import { env } from "~/env";

export const Qpay = new QpayService(
  env.QPAY_USERNAME,
  env.QPAY_PASSWORD,
  env.QPAY_INVOICE_CODE,
);
