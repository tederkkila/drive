import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
    slug: 'teams',
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
    ],
}
