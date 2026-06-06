import type { CollectionConfig } from 'payload'

export const Plays: CollectionConfig = {
    slug: 'plays',
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
