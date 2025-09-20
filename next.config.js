/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  outputFileTracingRoot: __dirname,
  
  // Улучшенная конфигурация TypeScript
  typescript: {
    ignoreBuildErrors: false, // Включено для продакшена
    tsconfigPath: './tsconfig.json'
  },
  
  // Улучшенная конфигурация ESLint
  eslint: {
    ignoreDuringBuilds: false, // Включено для продакшена
    dirs: ['src', 'pages', 'components', 'lib', 'utils']
  },
  
  // Безопасность
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; font-src 'self' data:;"
          }
        ]
      }
    ]
  },
  
  // Оптимизация изображений
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'cloudflare-ipfs.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Экспериментальные функции
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@solana/web3.js', '@solana/wallet-adapter-react']
  }
};

module.exports = nextConfig;