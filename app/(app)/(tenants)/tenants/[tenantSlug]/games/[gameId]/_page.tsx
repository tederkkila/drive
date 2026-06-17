import React, { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

import { GameView } from "@/modules/games/ui/GameView";

interface Props {
    params: Promise<{
        tenantSlug: string,
        gameId: string,
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug, gameId } = await params;

    console.log(`[gameId]page.tsx | game: ${gameId}`.toString());

    prefetch(
        trpc.games.getOne.queryOptions({
            gameId: gameId,
        })
    );

    return (

        <div className="flex flex-col gap-4">
            <h2>Game Data {gameId}</h2>
            <HydrateClient>
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <Suspense fallback={<div>GameView Loading...</div>}>
                        <GameView gameId={ gameId } />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>

        </div>
    );
}

export default Page;