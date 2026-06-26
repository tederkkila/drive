import type { CollectionConfig } from 'payload'

export const Games: CollectionConfig = {
    slug: 'games',
    admin: {
        useAsTitle: "name",
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
