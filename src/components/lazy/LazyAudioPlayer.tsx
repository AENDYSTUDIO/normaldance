'use client'

import { lazy, Suspense, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Ленивая загрузка компонента аудио плеера
const AudioPlayer = lazy(() => import('@/components/audio/audio-player').then(mod => ({ default: mod.AudioPlayer })))

interface LazyAudioPlayerProps extends ComponentProps<typeof AudioPlayer> {
  fallback?: React.ReactNode
}

export function LazyAudioPlayer({ 
  fallback = (
    <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      <span className="ml-2 text-sm text-muted-foreground">Загрузка плеера...</span>
    </div>
  ),
  ...props 
}: LazyAudioPlayerProps) {
  return (
    <Suspense fallback={fallback}>
      <AudioPlayer {...props} />
    </Suspense>
  )
}

// Экспортируем оригинальный компонент для использования в местах, где нужна немедленная загрузка
export { AudioPlayer }