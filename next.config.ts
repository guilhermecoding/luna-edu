import type { NextConfig } from "next";

const remotePatterns = [];

if (process.env.NEXT_PUBLIC_LOGO_CORPORATION) {
    remotePatterns.push(
        new URL(process.env.NEXT_PUBLIC_LOGO_CORPORATION),
    );
}

const nextConfig: NextConfig = {
    reactCompiler: true,
    cacheComponents: true,
    allowedDevOrigins: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
        ? process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS.split(",").map(o => o.trim())
        : [],
    images: {
        remotePatterns,
    },
};

export default nextConfig;
