import type { NextConfig } from "next";
import output from '@/amplify_outputs.json'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: `${output.storage.bucket_name}.s3.${output.storage.aws_region}.amazonaws.com`,
      pathname: '/**',
    }],
  }
};

export default nextConfig;
