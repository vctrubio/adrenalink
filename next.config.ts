import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        instrumentationHook: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
