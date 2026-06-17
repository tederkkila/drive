import { AppSidebar } from "@/modules/games/ui/app-sidebar"
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
import React, { Suspense } from "react";
import { GameView } from "@/modules/games/ui/GameView";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";

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
    //console.log("game from caller: ", game);

    prefetch(
        trpc.games.getGameWithDrives.queryOptions({
            gameId: gameId,
        })
    );

    return (
        <SidebarProvider>
            <AppSidebar />
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

                    <HydrateClient>
                        <ErrorBoundary fallback={<div>Something went wrong</div>}>
                            <Suspense fallback={<div>GameView Loading...</div>}>
                                <GameView gameId={ gameId } />
                            </Suspense>
                        </ErrorBoundary>
                    </HydrateClient>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Page;
