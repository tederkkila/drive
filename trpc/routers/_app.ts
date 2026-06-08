import { createTRPCRouter } from '../init';
import { tenantsRouter } from '@/modules/tenants/server/procedures';
// import { unitsRouter } from "@/modules/units/server/procedures";
// import { tagsRouter } from "@/modules/tags/server/procedures";
// import { attractionsRouter } from "@/modules/attractions/server/procedures";
// import { reservationsRouter } from "@/modules/reservations/server/procedures";
// import { ratesRouter } from "@/modules/rates/server/procedures";
// import { peakseasonsRouter } from "@/modules/peakseasons/server/procedures";

export const appRouter = createTRPCRouter({
    tenants: tenantsRouter,
    // tags: tagsRouter,
    // units: unitsRouter,
    // attractions: attractionsRouter,
    // reservations: reservationsRouter,
    // rates: ratesRouter,
    // peakseasons: peakseasonsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;