ALTER TABLE "nomad_competition_invoices" DROP COLUMN "id";
ALTER TABLE "nomad_competition_invoices" ADD COLUMN "id" serial PRIMARY KEY;
ALTER TABLE "nomad_competition_invoices" ADD COLUMN "invoice_code" varchar;
