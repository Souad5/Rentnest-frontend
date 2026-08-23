import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.80",
    "192.168.0.175",
    "192.168.0.80:3000",
    "192.168.0.175:3000",
    "192.168.0.175:3001",
    "192.168.0.80:3001",
    "localhost:3000",
    "localhost:3001",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "dam-assets.au.reastatic.net",
      },
    ],
  },
};

export default nextConfig;
