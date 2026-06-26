import React, { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

import { TenantRichText } from "@/modules/tenants/ui/components/TenantRichText"
import { GameListView } from "@/modules/games/ui/GameListView";

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