ALTER TABLE "nomad_competition_rounds" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_rounds" ADD COLUMN "is_age_group" boolean DEFAULT false NOT NULL;