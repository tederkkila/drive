"use client"

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { GameCard } from "./GameCard";
import { CircleBackslashIcon } from "@radix-ui/react-icons"

interface GameListProps {
    tenantSlug: string;
}

export const GameList = ({ tenantSlug }: GameListProps) => {

    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.games.getMany.queryOptions(
        {
            tenantSlug: tenantSlug,
            limit: 10,
        }
    ));

    //console.log("data", data)

    if (data.docs?.length === 0) {
        return (
            <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
                <CircleBackslashIcon />
                <p className="text-base font-medium">No games found</p>
            </div>
        )
    }

    return (
        <div>

            {data.docs.map((game) => (
                <GameCard key={game.id} game={game} />
            ))}


        </div>
    )
}