DO $$ BEGIN
 CREATE TYPE "public"."result_type" AS ENUM('ao5', 'ao3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"solve1" integer NOT NULL,
	"solve2" integer NOT NULL,
	"solve3" integer NOT NULL,
	"solve4" integer,
	"solve5" integer,
	"best" integer NOT NULL,
	"type" "result_type" NOT NULL,
	"cube_type_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
	"competitor_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "results_cube_type_id_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "results_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "results_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."nomad_competition_competitors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
