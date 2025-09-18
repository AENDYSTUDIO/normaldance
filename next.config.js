/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  // Отключаем статическую генерацию для всех страниц
  trailingSlash: false,
  generateStaticParams: false,
  // Отключаем пререндеринг
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
