CREATE TABLE IF NOT EXISTS "age_group_medals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"competition_id" integer NOT NULL,
	"cube_type_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"group" varchar NOT NULL,
	"age_group_id" integer NOT NULL,
	"medal" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"competition_id" integer NOT NULL,
	"cube_type_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"group" varchar NOT NULL,
	"result_id" integer,
	"medal" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank_average" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"cube_type_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"result_id" integer,
	"all_rank" integer NOT NULL,
	"province_rank" integer NOT NULL,
	"district_rank" integer NOT NULL,
	CONSTRAINT "rank_average_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank_single" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"cube_type_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"result_id" integer,
	"all_rank" integer NOT NULL,
	"province_rank" integer NOT NULL,
	"district_rank" integer NOT NULL,
	CONSTRAINT "rank_single_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" ADD COLUMN "age_group_id" integer;--> statement-breakpoint
ALTER TABLE "nomad_competition_rounds" ADD COLUMN "is_active" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_age_group_id_nomad_competition_age_groups_id_fk" FOREIGN KEY ("age_group_id") REFERENCES "public"."nomad_competition_age_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medals" ADD CONSTRAINT "medals_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medals" ADD CONSTRAINT "medals_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medals" ADD CONSTRAINT "medals_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medals" ADD CONSTRAINT "medals_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medals" ADD CONSTRAINT "medals_result_id_nomad_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."nomad_competition_results"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_result_id_nomad_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."nomad_competition_results"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_result_id_nomad_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."nomad_competition_results"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_age_group_id_nomad_competition_age_groups_id_fk" FOREIGN KEY ("age_group_id") REFERENCES "public"."nomad_competition_age_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
