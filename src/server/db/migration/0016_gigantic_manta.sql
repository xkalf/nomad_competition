ALTER TABLE "nomad_competition_competitions" ADD COLUMN "slug" varchar;--> statement-breakpoint
ALTER TABLE "nomad_competition_competitions" ADD CONSTRAINT "nomad_competition_competitions_slug_unique" UNIQUE("slug");