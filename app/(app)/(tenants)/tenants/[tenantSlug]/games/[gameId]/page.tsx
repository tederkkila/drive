import React, { Suspense } from "react";
import { AppSidebar } from "@/modules/games/ui/app-sidebar-checkboxes"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { ErrorBoundary } from "react-error-boundary";
import { GameViewClient } from "@/modules/games/ui/GameViewClient";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { GameProvider } from "@/modules/games/ui/GameContext";

interface Props {
    params: Promise<{
        tenantSlug: string,
        gameId: string,
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug, gameId } = await params;

    //console.log(`[gameId]page.tsx | game: ${gameId}`.toString());

    const game = await caller.games.getOne({ gameId });

    await Promise.all([
        prefetch(
            trpc.games.getDriveListForGame.queryOptions({
                gameId,
            }),
        ),
        prefetch(
            trpc.games.getGameWithDrives.queryOptions(
                { gameId },
                {
                    staleTime: 30 * 60 * 1000,
                    gcTime: 60 * 60 * 1000,
                    refetchOnWindowFocus: false,
                },
            ),
        ),
    ]);

    return (
        <GameProvider>
            <HydrateClient>
            <SidebarProvider>
                <ErrorBoundary fallback={<div>Error with sidebar</div>}>
                    <AppSidebar gameId={gameId} />
                </ErrorBoundary>
                <SidebarInset className="h-screen w-full flex flex-col overflow-hidden">
                    <header className="sticky top-0 flex h-8 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">{tenantSlug}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Games</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{game.name}</BreadcrumbPage>
                                </BreadcrumbItem>

                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">

                        {/*<HydrateClient>*/}
                            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                                <Suspense fallback={<div>GameView Loading...</div>}>
                                    <GameViewClient gameId={ gameId } />
                                </Suspense>
                            </ErrorBoundary>
                        {/*</HydrateClient>*/}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </HydrateClient>
        </GameProvider>
    )
}

export default Page;
