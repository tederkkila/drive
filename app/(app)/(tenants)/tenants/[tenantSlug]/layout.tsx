import React from 'react';
import { headers } from 'next/headers';
import { TRPCReactProvider } from '@/trpc/client';

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}

export default async function TenantLayout({
   children,
   params,
}: TenantLayoutProps) {
    const { tenantSlug } = await params;

    const headersList = await headers();

    const host =
        headersList.get('x-forwarded-host') ??
        headersList.get('host');

    const proto =
        headersList.get('x-forwarded-proto') ??
        'https';

    if (!host) {
        throw new Error('Missing request host');
    }

    const origin = `${proto}://${host}`;

    return (
        <TRPCReactProvider origin={origin} tenantSlug={tenantSlug}>
            {children}
        </TRPCReactProvider>
    );
}