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

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/`}>
                                {tenantSlug}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/games`}>
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