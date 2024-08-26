ALTER TABLE "nomad_competition_results" ALTER COLUMN "solve1" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ALTER COLUMN "solve2" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ALTER COLUMN "solve3" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ALTER COLUMN "best" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ALTER COLUMN "average" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ADD COLUMN "group" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_rounds" ADD COLUMN "per_group_count" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_age_groups" ADD CONSTRAINT "nomad_competition_age_groups_competition_id_cube_type_id_start_unique" UNIQUE("competition_id","cube_type_id","start");