/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // Wildcard to allow all hostnames
          pathname: '**', // Wildcard to allow all paths
        },
      ],
      domains: ['*'],
    },
  };
  
  module.exports = nextConfig;
  