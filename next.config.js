/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 500,
    };
    // Configure webpack cache with improved reliability
    if (process.env.NODE_ENV === 'development') {
      config.cache = {
        type: 'filesystem',
        version: '1',
        compression: 'gzip',
        buildDependencies: {
          config: [__filename],
          tsconfig: [path.resolve(__dirname, 'tsconfig.json')],
          env: ['.env.local', '.env']
        },
        name: 'next-swc-cache',
        cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
        idleTimeout: 60000,
        idleTimeoutForInitialStore: 0
      };
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;