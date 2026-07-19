import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cache } from 'react';

import { getPayload } from 'payload';
import config from "@payload-config";

import superjson from "superjson";

export const createTRPCContext = cache(async (opts?: FetchCreateContextFnOptions) => {
    /**
     * @see: https://trpc.io/docs/server/context
     */
    const payload = await getPayload({ config });

    const authResult = opts?.req
        ? await payload.auth({
            headers: opts.req.headers,
        })
        : null;

    const user = authResult?.user ?? null;

    return {
        db: payload,
        user,
        isAdmin: Boolean(user),
    };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {

    const payload = await getPayload({ config });
    return next({ ctx: { db: payload } });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
    const user = ctx.user;

    if (!user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required.",
        });
    }

    return next({
        ctx: {
            ...ctx,
            user,
        },
    });
});