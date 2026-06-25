import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { Config } from './payload-types'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { isSuperAdmin } from './lib/access';
import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities';

import { Tenants } from '@/collections/Tenants'
import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Teams } from '@/collections/Teams'
import { Games } from '@/collections/Games'
import { Drives } from '@/collections/Drives'
import { Plays } from '@/collections/Plays'

//Allows MONGODB to connect to the internet
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [
        Tenants,
        Users,
        Media,
        Teams,
        Games,
        Drives,
        Plays,
    ],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: mongooseAdapter({
        url: process.env.DATABASE_URL || '',
    }),
    sharp,
    plugins: [
        multiTenantPlugin<Config>({
            collections: {
                teams: {},
                games: {
                    useTenantAccess: false,
                },
                drives: {},
                plays: {},
                media: {},
            },
            tenantField: {
                access: {
                    read: () => true,
                    update: ({ req }) => {
                        if (isSuperAdmin(req.user)) {
                            return true
                        }
                        return getUserTenantIDs(req.user).length > 0
                    },
                },
            },
            tenantsArrayField: {
                includeDefaultField: false,
            },
            userHasAccessToAllTenants: (user) => isSuperAdmin(user),
        }),
        vercelBlobStorage({
            enabled: true,
            collections: {
                media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN || '',
        })
    ],
})
