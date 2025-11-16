/** @type {import('next').NextConfig} */
const nextConfig = require('next.config.js')

const config = {
  ...nextConfig,
  
  // Bundle Optimization
  experimental: {
    optimizePackageImports: [
      {
        package: 'lucide-react',
        preset: 'default',
      },
      {
        package: 'date-fns',
        preset: 'default',
      },
      {
        package: '@radix-ui/react-icons',
        preset: 'default',
      },
    ],
    turbotrace: {
      logLevel: 'error',
    },
    scrollRestoration: true,
    largePageDataBytes: 128 * 1024, // 128KB
  },

  // Code Splitting
  webpack: (config, { isServer }) => {
    const webpackConfig = {
      ...config,
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks for third-party libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Framework chunks for React and Next.js
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 20,
            },
            // Web3 libraries chunk
            web3: {
              test: /[\\/]node_modules[\\/](@solana|@tonconnect|@web3|ethers|wagmi|viem)[\\/]/,
              name: 'web3',
              chunks: 'all',
              priority: 15,
            },
            // UI libraries chunk
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion|class-variance-authority|cmdk|lucide)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 5,
            },
            // Common chunks for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: -10,
              enforce: true,
            },
          },
        },
        usedExports: {
          // Tree shaking for unused exports
          exports: 'auto',
        },
        sideEffects: false,
      },
      resolve: {
        alias: {
          // Path aliases for cleaner imports
          '@': require('path').resolve('./src'),
        },
      },
    }

    // Only apply webpack optimizations on client side
    if (!isServer) {
      return webpackConfig
    }

    return config
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analyzer
  webpackBundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },

  // Output optimization
  output: 'standalone',
  
  // Experimental features
  swcMinify: true,
  
  // Security headers
  headers: async () => {
    const headers = {}
    
    // Security headers for all routes
    if (process.env.NODE_ENV === 'production') {
      headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
      
      headers['X-Content-Type-Options'] = 'nosniff'
      headers['X-Frame-Options'] = 'DENY'
      headers['X-XSS-Protection'] = '1; mode=block'
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
      headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    }
    
    return headers
  },
}

module.exports = config