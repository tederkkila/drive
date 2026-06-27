import React from 'react';
import { headers } from 'next/headers';
import { TRPCReactProvider } from '@/trpc/client';

export default async function TenantLayout({
   children,
   params,
}: {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}) {
    const { tenantSlug } = await params;

    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') ?? 'https';

    if (!host) {
        throw new Error('Missing request host');
    }

    const origin = `${proto}://${host}`;

    console.log('origin', origin);
    console.log('tenantSlug', tenantSlug);

    return (
        <TRPCReactProvider origin={origin} tenantSlug={tenantSlug}>
            {children}
        </TRPCReactProvider>
    );
}