ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_competition_id_user_id_unique" UNIQUE("competition_id","user_id");