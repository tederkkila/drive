import 'server-only'; // <-- ensure this file cannot be imported from the client

import { createTRPCOptionsProxy, TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import type { AppRouter } from './routers/_app';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});

export const caller = appRouter.createCaller(createTRPCContext);

export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {props.children}
        </HydrationBoundary>
    );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
    queryOptions: T,
) {
    const queryClient = getQueryClient();

    if (queryOptions.queryKey[1]?.type === 'infinite') {
        //console.log('prefetching infinite query', queryOptions);
        void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
        //console.log('prefetching query', queryOptions);
        void queryClient.prefetchQuery(queryOptions);
    }
}