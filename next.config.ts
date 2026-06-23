import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ['sharp'],
};

//export default withPayload(nextConfig);
export default withPayload(nextConfig, {
    // Try setting this to false if the error persists
    devBundleServerPackages: false
})
