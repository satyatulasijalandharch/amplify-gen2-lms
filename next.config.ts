import type { NextConfig } from "next";
import outputs from '@/amplify_outputs.json'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(outputs.custom.thumbnailCdnUrl).hostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: `${outputs.storage.bucket_name}.s3.${outputs.storage.aws_region}.amazonaws.com`,
        pathname: "/**",
      },
    ],
  }
};

export default nextConfig;
