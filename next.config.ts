import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blessed-happiness-3e10a81db6.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blessed-happiness-3e10a81db6.media.strapiapp.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
