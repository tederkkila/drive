"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Box } from "@radix-ui/themes";
import { Drive } from "@/payload-types";
import { YouTubeAPIEmbed } from "@/modules/games/ui/YouTubeAPIEmbed";
import { DriveChart } from "@/modules/drives/ui/DriveChart"
import { GameWithTeamsWithDrives } from "@/modules/games/games";
import { useGameVideo } from "@/modules/games/ui/GameContext";

interface GameViewProps {
    gameId: string;
}

export const GameView = ({ gameId }: GameViewProps) => {

    const params = useParams<{ tenantSlug: string }>();
    const tenantSlug = params.tenantSlug;

    const { videoId, setVideoId } = useGameVideo();

    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.games.getGameWithDrives.queryOptions({ gameId: gameId }));
    const { data: authStatus } = useSuspenseQuery(trpc.games.getAuthStatus.queryOptions());
    const game: GameWithTeamsWithDrives = data;

    useEffect(() => {
        setVideoId(game.videoId);
    }, [game.videoId, setVideoId])

    // useEffect(() => {
    //     console.log("startTime", startTime);
    // }, [startTime])

    const drives: Drive[] = game.drives;

    const editHref = tenantSlug
        // ? `/tenants/${tenantSlug}/games/${game.id}/edit`
        ? `/games/${game.id}/edit`
        : undefined;

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">

                <Box className="bg-neutral-700">
                    <YouTubeAPIEmbed videoId={videoId} />
                </Box>

                <Box className="flex-1 overflow-y-scroll bg-gray-50
                  [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-neutral-200
                [&::-webkit-scrollbar-thumb]:bg-neutral-500
                  [&::-webkit-scrollbar-thumb]:rounded"
                >
                    <DriveChart
                        drives={drives}
                        teams={[game.homeTeam, game.awayTeam]}
                        isAuthenticated={authStatus.isAuthenticated}
                        editHref={editHref}
                    />

                </Box>

        </div>

    )
}