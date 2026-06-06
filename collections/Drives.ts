import type { CollectionConfig } from 'payload'

export const Drives: CollectionConfig = {
    slug: 'drives',
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
