import React, { Suspense } from "react";
import type { Metadata } from "next";
import { HydrateClient, prefetch, trpc, caller } from "@/trpc/server";
import { ErrorBoundary } from 'react-error-boundary';

import {Navbar, NavbarSkeleton} from "@/modules/tenants/ui/components/navbar";
import {Footer} from "@/modules/tenants/ui/components/footer";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
    const { slug } = await params;

    const tenant = await caller.tenants.getOne({ slug });

    const faviconUrl =
        tenant.favicon && typeof tenant.favicon === "object" && tenant.favicon.url
            ? `${process.env.NEXT_PUBLIC_APP_URL}${tenant.favicon.url}`
            : "/favicon.ico";

    return {
        title: tenant.name,
        icons: {
            icon: faviconUrl,
            shortcut: faviconUrl,
            apple: faviconUrl,
        },
    };
}

const Layout = async ({ children, params }: LayoutProps) => {
    const { slug } = await params;

    prefetch(
        trpc.tenants.getOne.queryOptions({ slug }),
    );

    return (
        <div className="wave4 min-h-screen relative w-full">

            <HydrateClient>
                <ErrorBoundary fallback={<div>Error Loading the Navigation Bar</div>}>
                    <Suspense fallback={<NavbarSkeleton />}>
                        <Navbar slug={ slug }/>
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>

            <div className="min-h-[calc(100vh-8rem)] bg-[#edededcc] sm:border-x
                max-w-full sm:max-w-[calc(100vw-2rem)] lg:max-w-7xl
                mx-auto">
                <div className="">
                    { children }
                </div>
            </div>

            <Footer />

        </div>
    );
};

export default Layout;