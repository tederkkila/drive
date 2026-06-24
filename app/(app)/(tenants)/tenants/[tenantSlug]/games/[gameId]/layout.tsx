import React from "react";
import type { Metadata } from "next";
import { caller } from "@/trpc/server";
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



const Layout = async ({ children }: LayoutProps) => {

    return (
        <div>
            { children }
        </div>
    );
};

export default Layout;