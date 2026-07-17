import React from "react";
import { caller } from "@/trpc/server";
import { NewGameForm } from "@/modules/games/ui/NewGameForm";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
    params: Promise<{
        tenantSlug: string;
    }>;
}

const Page = async ({ params }: Props) => {
    const { tenantSlug } = await params;

    // Get tenant data to extract tenant ID
    const tenant = await caller.tenants.getOne({ tenantSlug });

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/tenants/${tenantSlug}`}>
                                {tenantSlug}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/tenants/${tenantSlug}/games`}>
                                Games
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>New Game</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>


            <NewGameForm tenantSlug={tenantSlug} />
        </div>
    );
};

export default Page;