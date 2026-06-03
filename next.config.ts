import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    emotion: true,
    styledComponents: true,
  },
};

export default nextConfig;
