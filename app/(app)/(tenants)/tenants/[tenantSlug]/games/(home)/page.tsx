import React, { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

import { GameListView } from "@/modules/games/ui/GameListView";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
    params: Promise<{
        tenantSlug: string,
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug } = await params;

    prefetch(
        trpc.tenants.getOne.queryOptions({
            tenantSlug: tenantSlug,
        })
    );

    prefetch(
        trpc.games.getMany.queryOptions({
            tenantSlug: tenantSlug,
            limit: 10,
        })
    );



    return (
        <div className="flex flex-col gap-4">

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Games</h1>
                <Link href={`/games/new`}>
                    <Button>New Game</Button>
                </Link>
            </div>

            <HydrateClient>
                <ErrorBoundary fallback={<div>Error rendering content</div>}>
                    <Suspense>
                        <GameListView tenantSlug={tenantSlug} />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>

        </div>
    );
}

export default Page;