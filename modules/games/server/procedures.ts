import z from "zod";
import { TRPCError } from "@trpc/server";
import { Drive, Game } from "@/payload-types";
import { GameWithTeamsWithDrives, GameWithTeams } from "@/modules/games/games"

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const ensureGameHasPopulatedTeams = (game: Game): GameWithTeams => {
    if (typeof game.homeTeam === "string" || typeof game.awayTeam === "string") {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Game teams were not populated",
        });
    }

    return game as GameWithTeams;
};

export const gamesRouter = createTRPCRouter({
    getGameWithDrives:baseProcedure
        .input(z.object({
            gameId: z.string(),
        }),)
        .query(async ({ctx, input}) => {

            const gamesData = await ctx.db.find({
                collection: "games",
                depth: 1,
                where: {
                    id: {
                        equals: input.gameId,
                    },
                },
                limit: 1,
                pagination: false,
            });

            const game: Game = gamesData.docs[0];
            //console.log("game.name: " + game.name)

            if (!game) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
            }

            const gameWithTeams = ensureGameHasPopulatedTeams(game);

            const drivesData = await ctx.db.find({
                collection: "drives",
                depth: 2,
                where: {
                    game: {
                        equals: input.gameId,
                    },
                },
                sort: "driveNumber",
                limit: 100,
                pagination: false,
            });

            //console.log("drivesData: ", drivesData)

            if (!drivesData) {
                throw new TRPCError({code: "NOT_FOUND", message: "No Drives Found"});
            }

            const gameWithDrives: GameWithTeamsWithDrives = {
                ...gameWithTeams,
                drives: drivesData.docs as Drive[],
            };

            return gameWithDrives;

        }),
    getOne:baseProcedure
        .input(z.object({
            gameId: z.string(),
        }),)
        .query(async ({ctx, input}) => {

            const gamesData = await ctx.db.find({
                collection: "games",
                depth: 1,
                where: {
                    id: {
                        equals: input.gameId,
                    },
                },
                limit: 1,
                pagination: false,
            });

            const game = gamesData.docs[0];
            //console.log("game.name: " + game.name)

            if (!game) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
            }

            return ensureGameHasPopulatedTeams(game);

        }),
    getMany: baseProcedure
        .input(
            z.object({
                tenantSlug: z.string(),
                limit: z.number().optional(),
            }),
        )
        .query(async ({ctx, input}) => {

            const gamesData = await ctx.db.find({
                collection: "games",
                depth: 2,
                where: {
                    "tenants.slug": {
                        in: input.tenantSlug,
                    },
                },
                sort: "-date",
                limit: input.limit ?? 10,
                pagination: false,
            });

            //console.log("gamesData: ", gamesData)

            if (!gamesData) {
                throw new TRPCError({code: "NOT_FOUND", message: "No Games Found"});
            }

            return {
                ...gamesData,
                docs: gamesData.docs.map(ensureGameHasPopulatedTeams),
            };
        }),
});