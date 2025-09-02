/**
 * Оптимизированные роуты с ленивой загрузкой
 */

import { lazy, Suspense } from 'react'
import { createLazyRoute } from '@/lib/lazy-utils'

// Ленивая загрузка страниц
const LazyHomePage = createLazyRoute(() => import('@/app/page'))
const LazyNFTMarketplacePage = createLazyRoute(() => import('@/app/nft-marketplace/page'))
const LazyTracksPage = createLazyRoute(() => import('@/app/tracks/page'))
const LazyProfilePage = createLazyRoute(() => import('@/app/profile/page'))
const LazyWalletPage = createLazyRoute(() => import('@/app/wallet/page'))

// Компоненты для ленивой загрузки
const LazyAudioPlayer = lazy(() => import('@/components/audio/audio-player'))
const LazyNFTCard = lazy(() => import('@/components/nft/nft-card'))
const LazyRecommendationEngine = lazy(() => import('@/components/recommendations/recommendation-engine'))

// Обертки для роутов с предзагрузкой
export function OptimizedHomePage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LazyHomePage />
    </Suspense>
  )
}

export function OptimizedNFTMarketplacePage() {
  return (
    <Suspense fallback={<div>Загрузка NFT маркетплейса...</div>}>
      <LazyNFTMarketplacePage />
    </Suspense>
  )
}

export function OptimizedTracksPage() {
  return (
    <Suspense fallback={<div>Загрузка треков...</div>}>
      <LazyTracksPage />
    </Suspense>
  )
}

export function OptimizedProfilePage() {
  return (
    <Suspense fallback={<div>Загрузка профиля...</div>}>
      <LazyProfilePage />
    </Suspense>
  )
}

export function OptimizedWalletPage() {
  return (
    <Suspense fallback={<div>Загрузка кошелька...</div>}>
      <LazyWalletPage />
    </Suspense>
  )
}

// Компоненты для предзагрузки
export function PreloadableAudioPlayer() {
  return (
    <Suspense fallback={<div>Загрузка плеера...</div>}>
      <LazyAudioPlayer />
    </Suspense>
  )
}

export function PreloadableNFTCard() {
  return (
    <Suspense fallback={<div>Загрузка NFT карты...</div>}>
      <LazyNFTCard />
    </Suspense>
  )
}

export function PreloadableRecommendationEngine() {
  return (
    <Suspense fallback={<div>Загрузка рекомендаций...</div>}>
      <LazyRecommendationEngine />
    </Suspense>
  )
}

// Хук для предзагрузки роутов
export function usePreloadRoute(routePath: string) {
  const preloadRoute = async () => {
    switch (routePath) {
      case '/nft-marketplace':
        await import('@/app/nft-marketplace/page')
        break
      case '/tracks':
        await import('@/app/tracks/page')
        break
      case '/profile':
        await import('@/app/profile/page')
        break
      case '/wallet':
        await import('@/app/wallet/page')
        break
      default:
        break
    }
  }
  
  return { preloadRoute }
}