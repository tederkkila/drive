'use client'

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from "@/trpc/client";
import { RichText } from '@payloadcms/richtext-lexical/react'
import React from "react";
import { Box } from "@radix-ui/themes";

interface TenantProps {
    tenantSlug: string;
}

export const TenantRichText = ({ tenantSlug }: TenantProps) => {

    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ tenantSlug }));

    return (
        <Box className="prose lg:prose-lg max-w-none prose-stone">
            {data.content && (
                <RichText data={data.content}/>
            )}
        </Box>

    )
}
