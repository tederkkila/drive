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
    const hostname = req.headers.get("host") || "";

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
    const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "";

    // console.log("hostname: ", hostname);
    // console.log("rootDomain: ", rootDomain);
    // console.log("adminDomain: ", adminDomain);

    if (adminDomain && hostname === adminDomain) {
        return NextResponse.next();
    }

    if (hostname.endsWith(`.${rootDomain}`)) {
        const tenantSlug = hostname.replace(`.${rootDomain}`, "");

        if (tenantSlug && tenantSlug !== "www" && tenantSlug !== "drive") {
            return NextResponse.rewrite(
                new URL(`/tenants/${tenantSlug}${url.pathname}${url.search}`, req.url) as any
            );
        }
    }

    return NextResponse.next();
};