'use client'

import { lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'

// Ленивая загрузка компонента рекомендаций
const RecommendationEngine = lazy(() => import('@/components/recommendations/recommendation-engine').then(mod => ({ default: mod.RecommendationEngine })))

interface LazyRecommendationEngineProps {
  fallback?: React.ReactNode
  userId?: string
}

export function LazyRecommendationEngine({
  fallback = (
    <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      <span className="ml-2 text-sm text-muted-foreground">Загрузка рекомендаций...</span>
    </div>
  ),
  userId
}: LazyRecommendationEngineProps) {
  return (
    <Suspense fallback={fallback}>
      <RecommendationEngine />
    </Suspense>
  )
}

// Экспортируем оригинальный компонент для использования в местах, где нужна немедленная загрузка
export { RecommendationEngine }