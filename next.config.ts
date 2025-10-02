import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations pour la performance
  reactStrictMode: true,

  // Compiler les packages pour réduire la taille du bundle
  transpilePackages: ['@tabler/icons-react'],

  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.novic.dev',
      },
    ],
  },

  // ESLint et TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Expérimental : améliore les performances
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
    ],
  },
};

export default nextConfig;
