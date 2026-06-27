import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
        * Match all paths except for:
        * 1. /api routes
        * 2. /_next (Next.js internals)
        * 3. /_static (inside /public)
        * 4. all root files inside /public (e.g. /favicon.ico)
        */
        "/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    // Extract the hostname (e.g., "antonio.funroad.com" or "john.localhost:3000")
    const hostname = req.headers.get("host") || "";

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

    if (hostname.endsWith(`.${rootDomain}`)) {
        const tenantSlug = hostname.replace(`.${rootDomain}`, "");

        if (tenantSlug !== "www") {
            return NextResponse.rewrite(new URL(`/tenants/${tenantSlug}${url.pathname}${url.search}`, req.url) as any);
        }
    }

    return NextResponse.next();
};