import z from "zod";
import { TRPCError } from "@trpc/server";
import { Drive } from "@/payload-types";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const drivesRouter = createTRPCRouter({

    getMany: baseProcedure
        .input(
            z.object({
                gameId: z.string(),
                limit: z.number().optional(),
            }),
        )
        .query(async ({ctx, input}) => {

            const drivesData = await ctx.db.find({
                collection: "drives",
                depth: 2,
                where: {
                    game: {
                        equals: input.gameId,
                    },
                },
                limit: 100,
                pagination: false,
            });

            //console.log("drivesData: ", drivesData)

            if (!drivesData) {
                throw new TRPCError({code: "NOT_FOUND", message: "No Drives Found"});
            }

            return {
                ...drivesData,
                docs: drivesData.docs as Drive[],
            };
        }),
});