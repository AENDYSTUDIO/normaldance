/**
 * Performance Optimization Configuration for Normal Dance
 * Implements Core Web Vitals optimizations and bundle optimizations
 * Target: Lighthouse ≥ 90 scores, TTFB < 200ms, FCP < 1.5s
 */

import { headers } from 'next/headers'

// Dynamic imports for code splitting
const lazyAudioPlayer = () => import('@/components/audio/audio-player').then(mod => ({ default: mod.AudioPlayer }))
const lazyTrackCard = () => import('@/components/audio/track-card').then(mod => ({ default: mod.TrackCard }))

// Image optimization configuration
export const imageConfig = {
  domains: ['normaldance.ru', 'ipfs.io'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  dangerouslyAllowSVG: false,
  dangerouslyAllowUpscale: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
}

// Font optimization
export const fontConfig = {
  families: [
    {
      name: 'Inter',
      src: 'url(/fonts/Inter-Regular.woff2) format("woff2")',
      weight: '400',
      style: 'normal',
      display: 'swap'
    },
    {
      name: 'Inter',
      src: 'url(/fonts/Inter-Medium.woff2) format("woff2")',
      weight: '500',
      style: 'normal',
      display: 'swap'
    },
    {
      name: 'Inter',
      src: 'url(/fonts/Inter-Bold.woff2) format("woff2")',
      weight: '700',
      style: 'normal',
      display: 'swap'
    }
  ],
  preload: ['Inter-Regular.woff2', 'Inter-Medium.woff2'],
  subset: ['cyrillic', 'latin']
}

// Critical CSS inline strategy
export const criticalCss = `
  /* Above the fold critical styles */
  body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.5;background:#0a0a0a;color:#fff}
  .loading{opacity:0;animation:fadeIn 0.3s ease-out forwards}
  @keyframes fadeIn{to{opacity:1}}
  .button{display:inline-flex;align-items:center;justify-content:center;border-radius:8px;padding:12px 24px;font-weight:500;}
  .skeleton{background:linear-gradient(90deg,#1a1a1a 25%,#2a2a2a 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`

// Resource hints for performance
export const resourceHints = `
  <link rel="preconnect" href="https://ipfs.io" crossorigin>
  <link rel="preconnect" href="https://cloudflare-ipfs.com" crossorigin>
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//normaldance.ru" crossorigin>
  <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/Inter-Medium.woff2" as="font" type="font/woff2" crossorigin>
`

// Service worker configuration for caching
export const swConfig = {
  version: '1.0.0',
  cacheName: 'normaldance-cache-v1',
  cacheableRoutes: [
    '/tracks',
    '/playlists',
    '/profile',
    '/api/tracks',
    '/api/spotify/featured'
  ],
  staticAssets: [
    '/fonts/',
    '/favicon.ico',
    '/manifest.json'
  ],
  networkFirstPatterns: [
    '/api/tracks/',
    '/api/spotify/'
  ],
  cacheFirstPatterns: [
    '/fonts/',
    '/_next/static/',
    '/images/'
  ]
}

// Performance budget configuration
export const performanceBudget = {
  javascript: {
    maxSize: 300 * 1024, // 300KB gzipped
    timing: 150 // 150ms parse time
  },
  css: {
    maxSize: 50 * 1024 // 50KB gzipped
  },
  images: {
    maxSize: 500 * 1024, // 500KB per image
    webpOnly: true,
    lazyLoad: true
  },
  totalBlockingTime: {
    max: 200 // 200ms
  },
  firstContentfulPaint: {
    target: 1500 // 1.5s
  },
  largestContentfulPaint: {
    target: 2500 // 2.5s
  },
  timeToFirstByte: {
    target: 200 // 200ms
  }
}

// Bundle analyzer configuration
export const bundleAnalysis = {
  enabled: process.env.NODE_ENV === 'production',
  reportPath: '.next/bundle-analysis.json',
  treemapPath: '.next/bundle-treemap.html',
  excludeAssets: [
    /-chunk\./,
    /-manifest\./
  ],
  includeAssets: [
    /main/,
    /app/
  ],
  analysis: {
    maxAssetSize: 244 * 1024, // 244KB (webpack default)
    maxChunks: 40,
    maxGzippedSize: 100 * 1024, // 100KB
    minChunkSize: 20000 // 20KB
  }
}

// Runtime performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map()

  static mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.performance.mark(name)
    }
  }

  static measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measures = window.performance.getEntriesByName(name)
        const latestMeasure = measures[measures.length - 1]
        const duration = latestMeasure?.duration || 0
        this.metrics.set(name, duration)
        return duration
      } catch (error) {
        console.warn('Performance measurement failed:', error)
      }
    }
    return null
  }

  static getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  static getVitals(): {
    fcp?: number
    lcp?: number  
    fid?: number
    cls?: number
  } {
    const vitals: any = {}

    if (typeof window !== 'undefined') {
      // First Contentful Paint
      const fcp = this.getMetric('first-contentful-paint')
      if (fcp) vitals.fcp = fcp

      // Largest Contentful Paint
      const lcp = this.getMetric('largest-contentful-paint')
      if (lcp) vitals.lcp = lcp

      // First Input Delay
      const fid = this.getMetric('first-input-delay')
      if (fid) vitals.fid = fid

      // Cumulative Layout Shift
      const cls = this.getMetric('cumulative-layout-shift')
      if (cls) vitals.cls = cls
    }

    return vitals
  }

  static setupWebVitals(): void {
    if (typeof window !== 'undefined') {
      // FCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('first-contentful-paint', lastEntry.startTime)
      }).observe({ entryTypes: ['paint'] })

      // LCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('largest-contentful-paint', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // FID
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          this.metrics.set('first-input-delay', (entry as any).processingStart - entry.startTime)
        })
      }).observe({ entryTypes: ['first-input'] })

      // CLS
      let clsValue = 0
      new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          clsValue += (entry as any).value
          this.metrics.set('cumulative-layout-shift', clsValue)
        })
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }
}

// Optimized component loading strategy
export const lazyLoadStrategy = {
  // Components above the fold
  immediate: () => import('@/components/layout/main-layout'),
  
  // Components visible on first scroll
  priority: () => import('@/components/audio/track-grid'),
  
  // Components loaded after first paint
  normal: () => import('@/components/audio/audio-player'),
  
  // Components loaded on interaction
  onDemand: () => import('@/components/wallet/ton-wallet-connect')
}

// Critical resource timing optimization
export const criticalResources = [
  '/fonts/Inter-Regular.woff2',
  '/fonts/Inter-Medium.woff2',
  '/_next/static/css/app/layout.css',
  '/api/session',
  '/api/tracks/featured'
]

// CDN and caching strategies
export const cachingConfig = {
  staticAssets: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
    immutable: true
  },
  apiResponses: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
    immutable: false
  },
  userContent: {
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 300, // 5 minutes
    immutable: false
  }
}

export default {
  imageConfig,
  fontConfig,
  criticalCss,
  resourceHints,
  swConfig,
  performanceBudget,
  bundleAnalysis,
  PerformanceMonitor,
  lazyLoadStrategy,
  criticalResources,
  cachingConfig
}
