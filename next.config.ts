import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ['sharp'],
    allowedDevOrigins: [
        'localhost', '127.0.0.1',
        'lvh.me',
        'nz-men.lvh.me',
        'nz-u18.lvh.me',
        'nz-u16.lvh.me',
        'drive.lvh.me',
    ],
};

//export default withPayload(nextConfig);
export default withPayload(nextConfig, {
    // Try setting this to false if the error persists
    devBundleServerPackages: false
})
