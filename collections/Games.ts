import type { CollectionConfig } from 'payload'

export const Games: CollectionConfig = {
    slug: 'games',
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
