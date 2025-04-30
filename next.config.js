/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");

const nextConfig = {
  reactStrictMode: true,
  images :{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dkstatics-public.digikala.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "digikala.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.ex.pro",
        port: "",
        pathname: "/**",
      },
    ],
  }
}

// module.exports = createNextIntlPlugin(nextConfig);
module.exports = createNextIntlPlugin()(nextConfig);
