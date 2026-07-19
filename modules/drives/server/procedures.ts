import z from "zod";
import { TRPCError } from "@trpc/server";
import { Drive } from "@/payload-types";

import { adminProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";

const MIN_PLAY_DURATION_SECONDS = 4;

const playInputSchema = z.object({
    id: z.string().optional(),
    playNumber: z.number().optional(),
    quarter: z.number().min(1),
    down: z.number().min(1).max(4),
    yardsToGo: z.number(),
    hash: z.enum(["left", "middle", "right"]),
    youTubeStart: z.number(),
    youTubeEnd: z.number(),
    description: z.string().min(1),
    playType: z.enum([
        "run",
        "pass",
        "punt",
        "field_goal",
        "extra_point",
        "penalty",
        "timeout",
    ]).optional(),
    startFieldPosition: z.number(),
    endFieldPosition: z.number(),
    yardsGained: z.number(),
    penalty: z.string().optional(),
    penaltyYards: z.number().optional(),
    nullifyPlay: z.boolean().optional(),
}).refine(
    (play) => play.youTubeEnd >= play.youTubeStart + MIN_PLAY_DURATION_SECONDS,
    {
        message: `YouTube end time must be at least ${MIN_PLAY_DURATION_SECONDS} seconds after start time.`,
        path: ["youTubeEnd"],
    },
);

const drivePropertiesInputSchema = z.object({
    driveId: z.string(),
    driveNumber: z.number().min(1),
    possessingTeam: z.string().optional(),
    direction: z.enum(["left", "right"]),
    startFieldPosition: z.number(),
    result: z.enum([
        "touchdown",
        "field_goal",
        "interception",
        "fumble_lost",
        "turnover_on_downs",
        "punt",
        "end_of_period",
    ]).optional(),
});

const getRelationshipId = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        return value;
    }

    if (
        value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string"
    ) {
        return value.id;
    }

    return undefined;
};

export const drivesRouter = createTRPCRouter({
    createNextForGame: adminProcedure
        .input(
            z.object({
                gameId: z.string(),
                tenantSlug: z.string(),
                possessingTeamId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {

            console.log("input: ", input)

            let existingDrives;

            try {
                existingDrives = await ctx.db.find({
                    collection: "drives",
                    depth: 0,
                    where: {
                        game: {
                            equals: input.gameId,
                        },
                    },
                    sort: "-driveNumber",
                    limit: 1,
                    pagination: false,
                    select: {
                        driveNumber: true,
                    },
                });
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to load existing drives.",
                });
            }

            const lastDriveNumber = existingDrives.docs[0]?.driveNumber;

            if (lastDriveNumber !== undefined && !Number.isFinite(lastDriveNumber)) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid drive number found.",
                });
            }

            const nextDriveNumber = (lastDriveNumber ?? 0) + 1;

            // console.log("lastDriveNumber: ", lastDriveNumber)
            // console.log("nextDriveNumber: ", nextDriveNumber)

            const game = await ctx.db.findByID({
                collection: "games",
                id: input.gameId,
                depth: 0,
            });

            if (!game) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
            }

            const tenantId = getRelationshipId(game.tenant);

            if (!tenantId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Game does not have an assigned tenant.",
                });
            }

            const candidatePossessingTeamIds = [
                input.possessingTeamId,
                getRelationshipId(game.homeTeam),
                getRelationshipId(game.awayTeam),
            ].filter((teamId): teamId is string => Boolean(teamId));

            let fallbackPossessingTeam: string | undefined;

            for (const teamId of candidatePossessingTeamIds) {
                const team = await ctx.db.findByID({
                    collection: "teams",
                    id: teamId,
                    depth: 0,
                });

                const teamTenantId = getRelationshipId(team?.tenant);

                if (team && teamTenantId === tenantId) {
                    fallbackPossessingTeam = team.id;
                    break;
                }
            }

            if (!fallbackPossessingTeam) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        "Could not find a possessing team assigned to the same tenant as this game.",
                });
            }

            return ctx.db.create({
                collection: "drives",
                data: {
                    tenant: tenantId,
                    game: game.id,
                    possessingTeam: fallbackPossessingTeam,
                    driveNumber: nextDriveNumber,
                    direction: "right",
                    startFieldPosition: 25,
                    result: "punt",
                    plays: [],
                },
            });
        }),

    updateDriveProperties: adminProcedure
        .input(drivePropertiesInputSchema)
        .mutation(async ({ ctx, input }) => {
            const data: {
                driveNumber: number;
                possessingTeam?: string;
                direction: "left" | "right";
                startFieldPosition: number;
                result?: "touchdown" | "field_goal" | "interception" | "fumble_lost" | "turnover_on_downs" | "punt" | "end_of_period";
            } = {
                driveNumber: input.driveNumber,
                direction: input.direction,
                startFieldPosition: input.startFieldPosition,
                result: input.result,
            };

            if (input.possessingTeam) {
                data.possessingTeam = input.possessingTeam;
            }

            return ctx.db.update({
                collection: "drives",
                id: input.driveId,
                data,
            });
        }),

    updatePlays: adminProcedure
        .input(
            z.object({
                driveId: z.string(),
                plays: z.array(playInputSchema),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const plays = input.plays.map((play, index) => ({
                ...play,
                playNumber: index + 1,
            }));

            return ctx.db.update({
                collection: "drives",
                id: input.driveId,
                data: {
                    plays,
                },
            });
        }),

    getOne: baseProcedure
        .input(
            z.object({
                driveId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const drive = await ctx.db.findByID({
                collection: "drives",
                id: input.driveId,
                depth: 1,
            });

            if (!drive) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Drive not found",
                });
            }

            return drive as Drive;
        }),

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