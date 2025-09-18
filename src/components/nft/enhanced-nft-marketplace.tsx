'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Search, Filter, Grid, List, Heart, Share, ShoppingCart, Eye, TrendingUp, Star } from '@/components/icons'
import { cn } from '@/lib/utils'

interface NFT {
  id: string
  title: string
  artist: string
  price: number
  currency: 'SOL' | 'NDT'
  image: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  likes: number
  views: number
  isLiked: boolean
  tags: string[]
  createdAt: Date
}

interface EnhancedNFTMarketplaceProps {
  className?: string
}

const mockNFTs: NFT[] = [
  {
    id: '1',
    title: 'Cosmic Beats #001',
    artist: 'DJ Cosmos',
    price: 2.5,
    currency: 'SOL',
    image: '/placeholder-nft.jpg',
    description: 'Unique cosmic-themed music NFT',
    rarity: 'legendary',
    likes: 234,
    views: 1250,
    isLiked: false,
    tags: ['electronic', 'cosmic', 'rare'],
    createdAt: new Date()
  },
  // Add more mock NFTs...
]

export const EnhancedNFTMarketplace = memo(function EnhancedNFTMarketplace({
  className
}: EnhancedNFTMarketplaceProps) {
  const [nfts, setNfts] = useState<NFT[]>(mockNFTs)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'likes' | 'views' | 'date'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredAndSortedNFTs = useMemo(() => {
    let filtered = nfts.filter(nft => {
      const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           nft.artist.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterBy === 'all' || nft.rarity === filterBy
      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price
        case 'likes':
          return b.likes - a.likes
        case 'views':
          return b.views - a.views
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })
  }, [nfts, searchQuery, sortBy, filterBy])

  const handleLike = useCallback((nftId: string) => {
    setNfts(prev => prev.map(nft => 
      nft.id === nftId 
        ? { ...nft, isLiked: !nft.isLiked, likes: nft.isLiked ? nft.likes - 1 : nft.likes + 1 }
        : nft
    ))
  }, [])

  const handleBuy = useCallback(async (nftId: string) => {
    setLoading(true)
    try {
      // Implement buy logic
      console.log('Buying NFT:', nftId)
    } catch (error) {
      console.error('Error buying NFT:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getRarityColor = (rarity: NFT['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500'
      case 'rare': return 'bg-blue-500'
      case 'epic': return 'bg-purple-500'
      case 'legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const NFTCard = memo(({ nft }: { nft: NFT }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={nft.image} 
          alt={nft.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 left-2">
          <Badge className={cn('text-white', getRarityColor(nft.rarity))}>
            {nft.rarity}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={() => handleLike(nft.id)}
          >
            <Heart className={cn('h-4 w-4', nft.isLiked && 'fill-red-500 text-red-500')} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold truncate">{nft.title}</h3>
          <p className="text-sm text-muted-foreground">by {nft.artist}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {nft.likes}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {nft.views}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-lg font-bold">{nft.price} {nft.currency}</span>
            </div>
            <EnhancedButton
              size="sm"
              onClick={() => handleBuy(nft.id)}
              loading={loading}
              leftIcon={<ShoppingCart className="h-4 w-4" />}
            >
              Купить
            </EnhancedButton>
          </div>
        </div>
      </CardContent>
    </Card>
  ))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NFT Marketplace</h1>
          <p className="text-muted-foreground">Откройте для себя уникальные музыкальные NFT</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск NFT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">По дате</SelectItem>
            <SelectItem value="price">По цене</SelectItem>
            <SelectItem value="likes">По лайкам</SelectItem>
            <SelectItem value="views">По просмотрам</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="common">Обычные</SelectItem>
            <SelectItem value="rare">Редкие</SelectItem>
            <SelectItem value="epic">Эпические</SelectItem>
            <SelectItem value="legendary">Легендарные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Загрузка NFT..." />
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {filteredAndSortedNFTs.map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}

      {filteredAndSortedNFTs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">NFT не найдены</p>
        </div>
      )}
    </div>
  )
})