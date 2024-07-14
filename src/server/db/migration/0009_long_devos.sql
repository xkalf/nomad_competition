CREATE TABLE IF NOT EXISTS "nomad_competition_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"cube_type_id" integer NOT NULL,
	"is_duel" boolean DEFAULT false,
	"name" varchar NOT NULL,
	"next_competitor" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nomad_competition_cube_types" ADD COLUMN "type" "result_type" DEFAULT 'ao5' NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ADD COLUMN "round_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ADD COLUMN "created_user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_results" ADD COLUMN "updated_user_id" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_rounds" ADD CONSTRAINT "nomad_competition_rounds_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_rounds" ADD CONSTRAINT "nomad_competition_rounds_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "nomad_competition_results_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "nomad_competition_results_created_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("created_user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_results" ADD CONSTRAINT "nomad_competition_results_updated_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("updated_user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
