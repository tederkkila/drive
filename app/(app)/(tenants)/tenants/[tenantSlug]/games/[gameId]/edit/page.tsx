import React, { Suspense } from "react";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
    params: Promise<{
        tenantSlug: string;
        gameId: string;
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug, gameId } = await params;

    const game = await caller.games.getOne({ gameId });

    prefetch(
        trpc.games.getDriveListForGame.queryOptions({
            gameId: gameId,
        })
    );

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/`}>
                                {tenantSlug}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/games`}>
                                Games
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{game.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Edit Game: {game.name}</h1>
                    <Link href={`/games/${gameId}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">View Game</Button>
                    </Link>
                </div>

                <HydrateClient>
                    <ErrorBoundary fallback={<div>Error loading drives</div>}>
                        <Suspense fallback={<div>Loading drives...</div>}>
                            {/* Drive management component will go here */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Button>Add New Drive</Button>
                                </div>

                                {/* Placeholder for drive list */}
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <p className="text-sm text-muted-foreground">
                                        Drive management interface coming soon.
                                        You can add functionality to create and edit drives here.
                                    </p>
                                </div>
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </HydrateClient>
            </div>
        </div>
    );
};

export default Page;