import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // experimental: {
    //     instrumentationHook: true,
    // },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.adrenalink.tech",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
