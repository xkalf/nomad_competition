ALTER TABLE "age_group_medals" DROP CONSTRAINT "age_group_medals_result_id_nomad_competition_results_id_fk";
--> statement-breakpoint
ALTER TABLE "medals" DROP CONSTRAINT "medals_result_id_nomad_competition_results_id_fk";
--> statement-breakpoint
ALTER TABLE "age_group_medals" ADD CONSTRAINT "age_group_medals_result_id_nomad_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."nomad_competition_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medals" ADD CONSTRAINT "medals_result_id_nomad_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."nomad_competition_results"("id") ON DELETE cascade ON UPDATE no action;