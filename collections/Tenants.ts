import type { CollectionConfig, Field } from 'payload'

export const Tenants: CollectionConfig = {
    slug: 'tenants',
    admin: {
        useAsTitle: 'slug',
    },
    defaultPopulate: {

    },
    fields: [
        {
            name: "name",
            required: true,
            type: "text",
            label: "Location Name",
            admin: {
                description: "This is the name of the Organization",
            },
        },
        {
            name: "slug",
            type: "text",
            index: true,
            required: true,
            unique: true,
            admin: {
                description:
                    "This is the subdomain for the location (e.g. [slug].henrymitchell.net)",
            },
        },
        {
            name: "icon",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: 'favicon',
            type: 'upload',
            relationTo: 'media', // Points to your Payload media collection
        },
    ] as Field[],
}