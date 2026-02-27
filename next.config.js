/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "intranet_vertical.sltds.lk",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;