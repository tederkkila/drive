import type { CollectionConfig } from 'payload'
import type { Tenant } from "@/payload-types";
import { revalidateTag } from "next/cache";
import { gameCacheTags } from "@/modules/games/server/cache-tags";

type GameTenant = string | Tenant;

export const Games: CollectionConfig = {
    slug: 'games',
    admin: {
        useAsTitle: "name",
    },
    hooks: {
        afterChange: [
            ({ doc }) => {
                revalidateTag(gameCacheTags.game(doc.id), "max");
                revalidateTag(gameCacheTags.gameWithDrives(doc.id), "max");

                if (Array.isArray(doc.tenants)) {
                    doc.tenants.forEach((tenant: GameTenant) => {
                        if (typeof tenant === "object" && tenant?.slug) {
                            revalidateTag(gameCacheTags.tenantGames(tenant.slug), "max");
                        }
                    });
                }
            },
        ],
        afterDelete: [
            ({ doc }) => {
                revalidateTag(gameCacheTags.game(doc.id), "max");
                revalidateTag(gameCacheTags.gameWithDrives(doc.id), "max");

                if (Array.isArray(doc.tenants)) {
                    doc.tenants.forEach((tenant: GameTenant) => {
                        if (typeof tenant === "object" && tenant?.slug) {
                            revalidateTag(gameCacheTags.tenantGames(tenant.slug), "max");
                        }
                    });
                }
            },
        ],
    },
    defaultPopulate: {
        id: true,
    },
    fields: [
        {
            name: 'tenants', // Use plural to prevent any future system naming collisions
            type: 'relationship',
            relationTo: 'tenants',
            hasMany: true,  // Correctly accepts an array of tenant IDs
            required: true,
        },
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "slug",
            type: "text",
            required: true,
        },
        { name: 'date', type: 'date', required: true, index: true },
        { name: 'homeTeam', type: 'relationship', relationTo: 'teams', required: true },
        { name: 'awayTeam', type: 'relationship', relationTo: 'teams', required: true },
        { name: 'homeScore', type: 'number', defaultValue: 0 },
        { name: 'awayScore', type: 'number', defaultValue: 0 },
        { name: 'videoId', type: 'text', required: true}
    ],
}
