'use client'

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from "@/trpc/client";
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from "next/image";
import React from "react";
import { AspectRatio, Box, Grid, Flex, Container, Text, Skeleton } from "@radix-ui/themes";

interface TenantProps {
    slug: string;
}

export const TenantRichText = ({slug}: TenantProps) => {

    const trpc = useTRPC();
    const {data, isLoading} = useSuspenseQuery(trpc.tenants.getOne.queryOptions({slug}));

    return (
        <article className="border-b">
            <div>{isLoading}</div>
            <Box className="prose lg:prose-lg max-w-none prose-stone">
                {data.content && (
                    <RichText data={data.content}/>
                )}
            </Box>

        </article>

    )
}
