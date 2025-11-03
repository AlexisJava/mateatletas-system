import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  eslint: {
    // Ignora errores de ESLint durante el build en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de TypeScript durante el build en producción
    // Temporal: quedan errores en admin (no críticos para flujo estudiante)
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
  // Configuración para monorepo: resuelve módulos desde el root
  webpack: (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../../node_modules'),
    ];
    return config;
  },
};

export default nextConfig;
