import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Để sau này có thể đóng gói dự án bằng Docker.
  reactCompiler: true,
};

export default nextConfig;
