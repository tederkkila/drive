import z from "zod";
import { TRPCError } from "@trpc/server";
import { Drive, Game } from "@/payload-types";
import { GameWithTeamsWithDrives, GameWithTeams } from "@/modules/games/games"

import { adminProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";

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
    createGame: adminProcedure
        .input(z.object({
            tenants: z.array(z.string()).min(1, "At least one tenant is required"),
            name: z.string().min(1, "Game name is required"),
            slug: z.string().min(1, "Slug is required"),
            date: z.string().min(1, "Date is required"),
            homeTeam: z.string().min(1, "Home team is required"),
            awayTeam: z.string().min(1, "Away team is required"),
            homeScore: z.number().default(0),
            awayScore: z.number().default(0),
            videoId: z.string().min(1, "Video ID is required"),
        }))
        .mutation(async ({ ctx, input }) => {
            console.log("input: ", input)

            // Extract the single tenant ID from your incoming array
            // The multi-tenant plugin typically expects a single string ID, not an array
            const singleTenantId = input.tenants[0];

            const newGame = await ctx.db.create({
                collection: "games",
                data: {
                    // 1. Your manual schema field (expects the array)
                    tenants: input.tenants,

                    // 2. The Multi-Tenant Plugin's injected fields
                    tenant: singleTenantId,

                    name: input.name,
                    slug: input.slug,
                    date: input.date,
                    homeTeam: input.homeTeam,
                    awayTeam: input.awayTeam,
                    homeScore: input.homeScore,
                    awayScore: input.awayScore,
                    videoId: input.videoId,
                },
            });

            return newGame;
        }),
    getDriveListForGame: baseProcedure
        .input(z.object({
            gameId: z.string(),
        }))
        .query(async ({ ctx, input }) => {

            //console.time("games.getDriveListForGame total");
            //console.time("drives query");
            const drivesData = await ctx.db.find({
                collection: "drives",
                depth: 0,
                where: {
                    game: {
                        equals: input.gameId,
                    },
                },
                sort: "driveNumber",
                limit: 100,
                pagination: false,
                select: {
                    id: true,
                    driveNumber: true,
                },
            });
            //console.timeEnd("drives query");

            return drivesData.docs.map((drive) => ({
                id: drive.id,
                driveNumber: drive.driveNumber,
            }));
        }),
    getGameWithDrives:baseProcedure
        .input(z.object({
            gameId: z.string(),
        }),)
        .query(async ({ctx, input}) => {

            //console.time("games.getGameWithDrives total");
            //console.time("games query");
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
            //console.timeEnd("games query");

            const game: Game = gamesData.docs[0];
            //console.log("game.name: " + game.name)

            if (!game) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
            }

            const gameWithTeams = ensureGameHasPopulatedTeams(game);

            //console.time("drives query");
            const drivesData = await ctx.db.find({
                collection: "drives",
                depth: 1,
                where: {
                    game: {
                        equals: input.gameId,
                    },
                },
                sort: "driveNumber",
                limit: 100,
                pagination: false,
            });

            //console.timeEnd("drives query");

            //console.timeEnd("games.getGameWithDrives total");

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