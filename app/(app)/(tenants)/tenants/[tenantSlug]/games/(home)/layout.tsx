import React, { Suspense } from "react";
import type { Metadata } from "next";
import { HydrateClient, prefetch, trpc, caller } from "@/trpc/server";
import { ErrorBoundary } from 'react-error-boundary';

import {Navbar, NavbarSkeleton} from "@/modules/tenants/ui/components/Navbar";
import {Footer} from "@/modules/tenants/ui/components/Footer";

import { generateTenantFaviconDomain } from "@/lib/utils";


interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {

    const { tenantSlug } = await params;

    const tenant = await caller.tenants.getOne({ tenantSlug });

    const faviconUrl =
        tenant.favicon && typeof tenant.favicon === "object" && tenant.favicon.url
            ? `${generateTenantFaviconDomain(tenantSlug)}${tenant.favicon.url}`
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
    const { tenantSlug } = await params;

    prefetch(
        trpc.tenants.getOne.queryOptions({ tenantSlug }),
    );

    return (
        <div className="wave4 min-h-screen relative w-full">

            <HydrateClient>
                <ErrorBoundary fallback={<div>Error Loading the Navigation Bar</div>}>
                    <Suspense fallback={<NavbarSkeleton />}>
                        <Navbar tenantSlug={ tenantSlug }/>
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>

            <div className="min-h-[calc(100vh-8rem)] bg-[#edededcc] sm:border-x
                max-w-full
                mx-auto">
                <div className="p-4">
                    { children }
                </div>
            </div>

            <Footer />

        </div>
    );
};

export default Layout;