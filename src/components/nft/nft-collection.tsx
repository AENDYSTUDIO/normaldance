'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  Users, 
  Star, 
  Calendar,
  ExternalLink,
  TrendingUp
} from 'lucide-react'

interface CollectionCardProps {
  collection: any
  onSelect: (collection: any) => void
}

export function NFTCollection({ collection, onSelect }: CollectionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(collection)}>
      <div className="relative">
        <img
          src={collection.imageUrl || '/placeholder-album.jpg'}
          alt={collection.name}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={collection.verified ? 'default' : 'secondary'}>
            {collection.verified ? '✓' : '✗'}
          </Badge>
        </div>
        {collection.trending && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-orange-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Тренд
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 truncate">{collection.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {collection.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{collection.floorPrice} ETH</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{collection.owners}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{collection.volume24h} ETH</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{collection.totalSupply}</span>
          </div>
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(collection)
            }}
          >
            Просмотр
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            asChild
          >
            <a 
              href={`https://opensea.io/collection/${collection.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CollectionGridProps {
  collections: any[]
  onCollectionSelect: (collection: any) => void
  loading?: boolean
}

export function CollectionGrid({ collections, onCollectionSelect, loading = false }: CollectionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-t-lg"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <NFTCollection
          key={collection.id}
          collection={collection}
          onSelect={onCollectionSelect}
        />
      ))}
    </div>
  )
}

interface CollectionStatsProps {
  collection: any
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-xs text-muted-foreground">Floor Price</p>
          <p className="font-bold">{collection.floorPrice} ETH</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <p className="text-xs text-muted-foreground">Owners</p>
          <p className="font-bold">{collection.owners}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-xs text-muted-foreground">Volume 24h</p>
          <p className="font-bold">{collection.volume24h} ETH</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="font-bold">{collection.totalSupply}</p>
        </CardContent>
      </Card>
    </div>
  )
}