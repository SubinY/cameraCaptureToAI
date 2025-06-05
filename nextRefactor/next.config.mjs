/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // 代理到后端服务
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
  },
};

export default nextConfig; 