DO $$ BEGIN
 CREATE TYPE "public"."competitor_status" AS ENUM('Created', 'Verified', 'Cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" ADD COLUMN "status" "competitor_status" DEFAULT 'Created' NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_invoices" ADD COLUMN "has_competition_fee" boolean DEFAULT false NOT NULL;