/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@mateatletas/contracts'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
  },

  // ========================================
  // OPTIMIZACIONES DE PERFORMANCE
  // ========================================

  // Optimizar imports de librerías pesadas
  modularizeImports: {
    // Material-UI: solo importar lo que se usa
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    // Lucide React: tree-shaking automático
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Experimental: mejorar tree-shaking
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-chartjs-2',
      'recharts',
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimizar bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Three.js en su propio chunk (solo se carga si se usa)
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Material-UI en su propio chunk
            mui: {
              test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
              name: 'mui',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Charts en su propio chunk
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|recharts|react-chartjs-2)[\\/]/,
              name: 'charts',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Framer Motion (se usa en colonia)
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Vendors comunes
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
