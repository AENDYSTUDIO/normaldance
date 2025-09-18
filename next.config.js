/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем статическую генерацию полностью
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  // Отключаем пререндеринг для всех страниц
  trailingSlash: false,
  // Отключаем статическую генерацию
  generateStaticParams: false,
  // Принудительно динамический рендеринг
  dynamic: 'force-dynamic',
  images: {
    unoptimized: true
  },
  // Отключаем статическую оптимизацию
  staticPageGenerationTimeout: 1000,
  // Отключаем автоматическую статическую оптимизацию
  swcMinify: false,
  // Отключаем статическую генерацию для всех маршрутов
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig