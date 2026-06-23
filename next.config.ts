import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverExternalPackages: ['sharp'],
    },
};

export default withPayload(nextConfig);
