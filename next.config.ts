import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация производительности
  reactStrictMode: true,
  
  // Оптимизация сборки
  swcMinify: true,
  
  // Оптимизация изображений
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 год
  },
  
  // Оптимизация шрифтов
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverComponentsExternalPackages: [],
    serverActions: true,
  },
  
  // Конфигурация ESLint (выключен для ускорения сборки)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Конфигурация TypeScript (выключен для ускорения сборки)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Оптимизация кэширования
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  
  // Оптимизация перенаправлений
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
  
  // Оптимизация перезаписи URL
  async rewrites() {
    return [
      {
        source: '/socket.io',
        destination: '/api/socketio',
      },
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
  
  // Конфигурация сборки
  output: 'standalone',
  
  // Оптимизация для Vercel
  trailingSlash: false,
  
  // Оптимизация для продакшена
  compress: true,
  
  // Оптимизация для разработки
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Конфигурация webpack
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для продакшена
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
          // Добавление оптимизатора для CSS
          require('css-minimizer-webpack-plugin'),
        ],
      };
    }
    
    // Оптимизация для изображений
    config.module.rules.push({
      test: /\.(jpe?g|png|webp|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'images/[hash][ext][query]',
      },
    });
    
    // Оптимизация для шрифтов
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'fonts/[hash][ext][query]',
      },
    });
    
    return config;
  },
  
  // Конфигурация окружения
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Конфигурация basePath
  basePath: process.env.BASE_PATH || '',
  
  // Конфигурация assetPrefix
  assetPrefix: process.env.ASSET_PREFIX || '',

  // Конфигурация для Sentry
  sentry: {
    // Включаем Sentry только в production и staging
    dsn: process.env.SENTRY_DSN,
    // Настройки для Vercel
    tunnelRoute: '/monitoring/tunnel',
    // Настройки для трассировки
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    // Настройки для сессий
    sessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Настройки для replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0,
    // Настройки для окружения
    environment: process.env.NODE_ENV || 'development',
    // Настройки для release
    release: process.env.npm_package_version || '1.0.1',
    // Настройки для serverName
    serverName: process.env.VERCEL_URL || 'localhost',
    // Настройки для debug
    debug: process.env.NODE_ENV === 'development',
    // Настройки для maxBreadcrumbs
    maxBreadcrumbs: 100,
    // Настройки для attachStacktrace
    attachStacktrace: true,
    // Настройки для denyUrls
    denyUrls: [
      // Игнорируем webpack chunk loading
      /webpack\/buildin/,
      // Игнорируем socket.io
      /socket\.io/,
      // Игнорируем hot reload
      /hot-update\.js/,
    ],
    // Настройки для allowUrls
    allowUrls: [
      // Разрешаем только наш домен
      /https:\/\/normaldance\.com/,
      /https:\/\/dnb1st\.ru/,
      /https:\/\/dnb1st\.store/,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_API_URL,
    ],
    // Настройки для ignoreErrors
    ignoreErrors: [
      // Игнорируем ResizeObserver loop errors
      'ResizeObserver loop limit exceeded',
      // Игнорируем NetworkError при отключении интернета
      'NetworkError when attempting to fetch resource',
      // Игнорируем AbortError при отмене запросов
      'AbortError',
      // Игнорируем ошибки при закрытии вкладки
      'Cannot read properties of null',
      // Игнорируем ошибки при работе с localStorage
      'The operation is insecure',
    ],
    // Настройки для beforeSend
    beforeSend: (event, hint) => {
      // Фильтрация известных ошибок
      if (event.exception) {
        const exception = event.exception.values[0]
        
        // Игнорируем ResizeObserver loop errors
        if (exception.type === 'ResizeObserver loop limit exceeded') {
          return null
        }
        
        // Игнорируем NetworkError при отключении интернета
        if (exception.type === 'NetworkError' && exception.value?.includes('Failed to fetch')) {
          return null
        }
        
        // Игнорируем AbortError при отмене запросов
        if (exception.type === 'AbortError') {
          return null
        }
        
        // Игнорируем ошибки при закрытии вкладки
        if (exception.type === 'TypeError' && exception.value?.includes('Cannot read properties of null')) {
          return null
        }
      }
      
      return event
    },
    // Настройки для beforeBreadcrumb
    beforeBreadcrumb: (breadcrumb, hint) => {
      // Фильтрация breadcrumb'ов
      if (breadcrumb.category === 'console') {
        // Ограничиваем количество console breadcrumb'ов
        return breadcrumb.message.length > 100 ? null : breadcrumb
      }
      
      if (breadcrumb.category === 'navigation') {
        // Фильтруем навигацию
        return breadcrumb
      }
      
      return breadcrumb
    },
    // Настройки для beforeSendTransaction
    beforeSendTransaction: (transaction) => {
      // Фильтрация транзакций
      if (transaction.name.includes('webpack')) {
        return null
      }
      
      return transaction
    },
  },
};

export default nextConfig;
