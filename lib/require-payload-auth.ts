import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

const getAdminLoginUrl = () => {
    const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;

    if (!adminDomain) {
        return "/admin/login";
    }

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    return `${protocol}://${adminDomain}/admin/login`;
};

export async function requirePayloadAuth() {
    const payload = await getPayload({ config });
    const requestHeaders = await headers();

    const { user } = await payload.auth({
        headers: requestHeaders,
    });

    if (!user) {
        redirect(getAdminLoginUrl());
    }

    return user;
}