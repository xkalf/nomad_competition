import { createTRPCRouter } from "~/server/api/trpc";
import { competitionRouter } from "./routers/competitions";
import { authRouter } from "./routers/auth";
import { cubeTypesRouter } from "./routers/cubeTypes";
import { competitorRouter } from "./routers/competitors";
import { schedulesRouter } from "./routers/schedules";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  competition: competitionRouter,
  auth: authRouter,
  cubeTypes: cubeTypesRouter,
  competitor: competitorRouter,
  schedule: schedulesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
