ALTER TABLE "rank_single" DROP CONSTRAINT "rank_single_userId_unique";--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" ADD COLUMN "province_id" uuid;--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" ADD COLUMN "district_id" uuid;--> statement-breakpoint
ALTER TABLE "rank_average" ADD COLUMN "province_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "rank_average" ADD COLUMN "district_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "rank_single" ADD COLUMN "province_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "rank_single" ADD COLUMN "district_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_average" ADD CONSTRAINT "rank_average_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "rank_single" ADD CONSTRAINT "rank_single_cubeTypeId_userId_unique" UNIQUE("cube_type_id","user_id");