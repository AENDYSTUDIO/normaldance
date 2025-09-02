'use client'

import { lazy, Suspense, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Ленивая загрузка компонента NFT маркетплейса
const NFTMarketplace = lazy(() => import('@/components/nft/nft-marketplace').then(mod => ({ default: mod.NFTMarketplace })))

interface LazyNFTMarketplaceProps extends ComponentProps<typeof NFTMarketplace> {
  fallback?: React.ReactNode
}

export function LazyNFTMarketplace({ 
  fallback = (
    <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      <span className="ml-2 text-sm text-muted-foreground">Загрузка NFT маркетплейса...</span>
    </div>
  ),
  ...props 
}: LazyNFTMarketplaceProps) {
  return (
    <Suspense fallback={fallback}>
      <NFTMarketplace {...props} />
    </Suspense>
  )
}

// Экспортируем оригинальный компонент для использования в местах, где нужна немедленная загрузка
export { NFTMarketplace }