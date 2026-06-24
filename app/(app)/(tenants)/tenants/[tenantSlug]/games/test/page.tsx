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
import React, { Suspense } from "react";
import { GameView } from "@/modules/games/ui/GameView";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Box } from "@radix-ui/themes";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    params: Promise<{
        tenantSlug: string,
        gameId: string,
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug, gameId } = await params;



    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-screen w-full flex flex-col overflow-hidden">
                <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/public">{tenantSlug}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Games</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Test</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div>
                    <Box className="max-w-5xl mx-auto bg-red-100">
                        <Skeleton className="h-100 w-full" />

                    </Box>
                    <Box className="flex-1 overflow-y-auto p-5 bg-gray-50">
                        <Skeleton className="h-100 w-100" />
                        <div>
                            <h1>Test</h1>
                            <p>This is a test page.</p>
                            <p>This is a test page.</p>
                            <p>It is not a game page.</p>
                            <p>It is not a game view.</p>
                            <p>It is not a game.</p>
                            <p>It is not a game drive.</p>
                            <p>It is not a game drive view.</p>
                        </div>
                    </Box>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Page;
