import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
    slug: 'teams',
    admin: {
        useAsTitle: "name",
    },
    fields: [
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
        {
            name: "level",
            type: "text",
            required: true,
        },
        {
            name: "abbreviation",
            type: "text",
            required: true,
        },
    ],
}
