import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    cacheComponents: true,
    allowedDevOrigins: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
        ? process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS.split(",").map(o => o.trim())
        : [],
};

export default nextConfig;
