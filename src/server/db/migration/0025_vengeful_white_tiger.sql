ALTER TABLE "nomad_competition_competitions" ALTER COLUMN "register_start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "nomad_competition_competitions" ALTER COLUMN "register_end_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "nomad_competition_invoices" ADD COLUMN "guest_count" integer DEFAULT 0 NOT NULL;