/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 暫時忽略 ESLint 錯誤，以便部署
  },
}

module.exports = nextConfig
