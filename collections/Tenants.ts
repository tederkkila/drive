import type { CollectionConfig, Field } from 'payload'
import {
    lexicalEditor,
    FixedToolbarFeature,
    HeadingFeature,
    OrderedListFeature,
    UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

export const Tenants: CollectionConfig = {
    slug: 'tenants',
    admin: {
        useAsTitle: 'slug',
    },
    defaultPopulate: {
        id: true,
    },
    fields: [
        {
            name: "name",
            required: true,
            type: "text",
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
        {
            name: "content",
            type: "richText",
            admin: {
                description: "This is the description of the tenant team",
            },
            editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                    ...defaultFeatures,
                    // Add a fixed toolbar
                    FixedToolbarFeature(),
                    // Add custom features
                    HeadingFeature({}),
                    OrderedListFeature(),
                    UnorderedListFeature(),
                ],
            }),
        },
        {
            name: "calendarContent",
            type: "richText",
            admin: {
                description: "This is the description of the tenant team",
            },
            editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                    ...defaultFeatures,
                    // Add a fixed toolbar
                    FixedToolbarFeature(),
                    // Add custom features
                    HeadingFeature({}),
                    OrderedListFeature(),
                    UnorderedListFeature(),
                ],
            }),
        },
    ] as Field[],
}