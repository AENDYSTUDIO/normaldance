import type { NextConfig } from "next";

// Add bundle analyzer if enabled
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// Sentry configuration to avoid OpenTelemetry conflicts
const withSentryConfig = (nextConfig: NextConfig) => {
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    return nextConfig;
  }

  // Import sentry only when needed to avoid OpenTelemetry conflicts
  const {
    withSentryConfig: sentryWithSentryConfig,
  } = require("@sentry/nextjs");
  const sentryWebpackPluginOptions = {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    org: process.env.SENTRY_ORG || "normal-dance",
    project: process.env.SENTRY_PROJECT || "normaldance",
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,
    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router pages or Route Handlers)
    automaticVercelMonitors: true,
  };

  return sentryWithSentryConfig(nextConfig, sentryWebpackPluginOptions);
};

const nextConfig: NextConfig = {
  // Оптимизация производительности
  reactStrictMode: true,

  // Оптимизация изображений
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 год
    domains: [
      "ipfs.io",
      "gateway.pinata.cloud",
      "cloudflare-ipfs.com",
      "localhost",
      "normaldance.com",
      "www.normaldance.com",
    ],
  },

  // Оптимизация шрифтов
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    // serverComponentsExternalPackages перенесён в serverExternalPackages
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  typedRoutes: true, // Enable typed route handlers for better type safety

  // Вне experimental начиная с Next 15
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "argon2",
    "sharp",
    "zod",
    "@solana/web3.js",
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-phantom",
    "@ton/core",
    "@ton/ton",
    "@tonconnect/sdk",
    "helia",
    "multiformats",
    "@helia/unixfs",
  ],

  // Конфигурация ESLint (включен для качества кода)
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Конфигурация TypeScript (включен для качества кода)
  typescript: {
    ignoreBuildErrors: false,
  },

  // 🔐 SECURITY: Enhanced headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 🔐 Content Security Policy (blocks XSS, clickjacking, code injection)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'wasm-unsafe-eval' https://telegram.org https://vercel.live",
              "style-src 'self' 'unsafe-inline'", // TailwindCSS requires inline styles
              "img-src 'self' data: blob: https://*.ipfs.io https://*.ipfs.dweb.link https://ipfs.io https://gateway.pinata.cloud https://cloudflare-ipfs.com",
              "connect-src 'self' https://api.mainnet-beta.solana.com https://ton.org https://tonapi.io wss://api.mainnet-beta.solana.com https://*.sentry.io",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'", // Prevents clickjacking
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // 🔐 X-Frame-Options (fallback for older browsers)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // 🔐 MIME type sniffing protection
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 🔐 Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 🔐 XSS protection (legacy, CSP is better)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 🔐 Strict Transport Security (enforce HTTPS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // 🔐 Permissions Policy (limit browser features)
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(self)",
          },
          // Cache control for static assets
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      // Add specific cache headers for static assets
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3153600, immutable",
          },
        ],
      },
      {
        source: "/(assets|images|icons)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3153600, immutable",
          },
        ],
      },
    ];
  },

  // Оптимизация перенаправлений
  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
    ];
  },

  // Оптимизация перезаписи URL
  async rewrites() {
    return [
      {
        source: "/socket.io",
        destination: "/api/socketio",
      },
      {
        source: "/api/health",
        destination: "/api/health",
      },
    ];
  },

  // Оптимизация для Vercel - убираем standalone output для лучшей совместимости
  // output: "standalone", // Раскомментировать только если нужно кастомный сервер
  // Оптимизация для Vercel
  trailingSlash: false,

  // Оптимизация для продакшена
  compress: true,

  // Оптимизация для разработки
  devIndicators: {
    // Переименовано: используем новый ключ position
    position: "bottom-right",
  },

  // Конфигурация webpack - оптимизирована для Vercel
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для продакшена
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
          // Добавление оптимизатора для CSS
          new CssMinimizerPlugin(),
        ],
      };
    }

    // Оптимизация для изображений
    config.module.rules.push({
      test: /\.(jpe?g|png|webp|gif|svg)$/i,
      type: "asset/resource",
      generator: {
        filename: "images/[hash][ext][query]",
      },
    });

    // Оптимизация для шрифтов
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
      generator: {
        filename: "fonts/[hash][ext][query]",
      },
    });

    // Add fallback for node-specific modules - оптимизировано для Vercel
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
        util: false,
      };
    } else {
      // For server-side, allow crypto module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false, // We'll handle crypto differently
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "@opentelemetry/instrumentation": false,
    };

    return config;
  },

  // Настройка корня трассировки для корректного определения монорепо/lockfile
  outputFileTracingRoot: process.cwd(),

  // Разрешённые origin'ы для dev (устранение предупреждения про cross-origin)
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // Конфигурация окружения
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Конфигурация basePath
  basePath: process.env.BASE_PATH || "",

  // Конфигурация assetPrefix
  assetPrefix: process.env.ASSET_PREFIX || "",

  // Конфигурация Sentry через @sentry/nextjs выполняется в плагине, не через next.config
};

// Export with bundle analyzer and conditional Sentry
export default withSentryConfig(withBundleAnalyzer(nextConfig));
