UPDATE "nomad_competition_schedules" SET "date" = now() WHERE "date" IS NULL;
ALTER TABLE "nomad_competition_schedules" ADD COLUMN "date" date NOT NULL;
