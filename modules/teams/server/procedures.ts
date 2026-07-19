import z from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const teamsRouter = createTRPCRouter({
    getAll: baseProcedure
        .input(
            z.object({
                tenantSlug: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
        const teamsData = await ctx.db.find({
            collection: "teams",
            depth: 0,
            where: {
                slug: {
                    equals: input.tenantSlug,
                },
            },
            limit: 100,
            pagination: false,
            sort: "name",
        });

        if (!teamsData) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Team Data not found" });
        }

        return teamsData;
    }),
});