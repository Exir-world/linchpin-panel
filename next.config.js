/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");

const nextConfig = {
  reactStrictMode: true,
}

module.exports = createNextIntlPlugin(nextConfig);
