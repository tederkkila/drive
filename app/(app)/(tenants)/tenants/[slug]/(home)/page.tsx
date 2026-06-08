import React, { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

import { TenantRichText } from "@/modules/tenants/ui/components/tenant-rich-text"

interface Props {
    params: Promise<{ slug: string }>;
}

const Page = async ({ params }: Props) => {
    const { slug } = await params;

    prefetch(
        trpc.tenants.getOne.queryOptions({
            slug: slug,
        })
    );

    return (
        <div className="flex flex-col gap-4">
            <HydrateClient>
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <Suspense>
                        <TenantRichText slug={slug} />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>

        </div>
    );
}

export default Page;