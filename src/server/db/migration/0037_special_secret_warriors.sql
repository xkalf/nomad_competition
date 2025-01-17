ALTER TABLE "schools" ADD COLUMN "province_id" uuid;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "district_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schools" ADD CONSTRAINT "schools_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schools" ADD CONSTRAINT "schools_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
