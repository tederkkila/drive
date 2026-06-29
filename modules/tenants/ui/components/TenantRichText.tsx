'use client'

import React from "react";
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from "@/trpc/client";
import { RichText } from '@payloadcms/richtext-lexical/react'
import {
    JSXConvertersFunction,
    LinkJSXConverter
} from '@payloadcms/richtext-lexical/react';
import { Box, Grid } from "@radix-ui/themes";
import { Tenant } from "@/payload-types";
import { internalDocToHref } from "@/modules/tenants/ui/components/internalLink";
import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
type NodeTypes = DefaultNodeTypes


export const jsxConverter: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
})

interface TenantProps {
    tenantSlug: string;
}

export const TenantRichText = ({ tenantSlug }: TenantProps) => {

    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ tenantSlug }));
    const tenant: Tenant = data;

    return (

        <article className="border-b">
            <Grid columns={{initial: '1', sm: '2'}} gapX='0' gapY={"4"}>

                <div className="pt-8 pr-8
                    md:border-r
                    md:col-span-1">
                    <Box className="prose  max-w-none prose-stone">
                        {tenant.content && (
                            <RichText data={tenant.content} converters={jsxConverter}/>
                        )}
                    </Box>
                </div>

                <div className="pt-8 pl-8
                        md:col-span-1">
                    <Box className="prose  ">
                        <h2 className="text-2xl border-b p-2 mb-8 bg-black text-white">Calendar</h2>
                        {tenant.calendarContent && (
                            <RichText data={tenant.calendarContent} converters={jsxConverter} />
                        )}
                    </Box>
                </div>

            </Grid>
        </article>




    )
}
