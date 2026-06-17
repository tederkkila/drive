import React, { Suspense } from "react";
import type { Metadata } from "next";
import { HydrateClient, prefetch, trpc, caller } from "@/trpc/server";
import { ErrorBoundary } from 'react-error-boundary';

import {Navbar, NavbarSkeleton} from "@/modules/tenants/ui/components/Navbar";
import {Footer} from "@/modules/tenants/ui/components/Footer";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {

    const { tenantSlug } = await params;

    const tenant = await caller.tenants.getOne({ tenantSlug });

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



const Layout = async ({ children }: LayoutProps) => {

    return (
        <div>
            { children }
        </div>
    );
};

export default Layout;