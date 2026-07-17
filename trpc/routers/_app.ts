import { createTRPCRouter } from '../init';

import { tenantsRouter } from '@/modules/tenants/server/procedures';
import { gamesRouter } from "@/modules/games/server/procedures";
import { drivesRouter } from "@/modules/drives/server/procedures";
import { teamsRouter } from "@/modules/teams/server/procedures";

export const appRouter = createTRPCRouter({
    tenants: tenantsRouter,
    games: gamesRouter,
    drives: drivesRouter,
    teams: teamsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;