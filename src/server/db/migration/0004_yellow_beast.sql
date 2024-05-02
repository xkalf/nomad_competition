ALTER TABLE "nomad_competition_competitions" ADD COLUMN "base_fee" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_competitions" ADD COLUMN "guest_fee" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_competitions" ADD COLUMN "free_guests" integer DEFAULT 0 NOT NULL;