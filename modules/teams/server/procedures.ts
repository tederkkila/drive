import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const teamsRouter = createTRPCRouter({
    getAll: baseProcedure.query(async ({ ctx }) => {
        const teamsData = await ctx.db.find({
            collection: "teams",
            depth: 0,
            limit: 100,
            pagination: false,
            sort: "name",
        });

        return teamsData;
    }),
});