"use client";

import React, { useEffect } from "react";
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

    const { videoId, setVideoId } = useGameVideo();

    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.games.getGameWithDrives.queryOptions({ gameId: gameId }));
    const game: GameWithTeamsWithDrives = data;
    //console.log("game", game)

    useEffect(() => {
        setVideoId(game.videoId);
    }, [game.videoId])

    // useEffect(() => {
    //     console.log("startTime", startTime);
    // }, [startTime])

    const drives: Drive[] = game.drives;

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
                    <DriveChart drives={drives} />

                </Box>

        </div>

    )
}