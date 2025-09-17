'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  ShoppingCart, 
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  Play,
  Download,
  Eye,
  TrendingUp
} from '@/components/icons'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

interface NFTDetail {
  id: string
  title: string
  description: string
  imageUrl: string
  audioUrl: string
  price: number
  artistId: string
  artist: {
    id: string
    username: string
    displayName: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
  isPublished: boolean
  metadata?: any
  royaltyPercentage?: number
  supply?: number
  isExplicit?: boolean
  _count: {
    likes: number
    comments: number
    owners: number
  }
}

export default function NFTDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [nft, setNft] = useState<NFTDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  const nftId = params.id as string

  useEffect(() => {
    if (nftId) {
      fetchNFTDetails(nftId)
    }
  }, [nftId])

  const fetchNFTDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nft/${id}`)
      if (response.ok) {
        const data = await response.json()
        setNft(data)
      } else {
        console.error('Failed to fetch NFT details')
      }
    } catch (error) {
      console.error('Error fetching NFT details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    setShowPurchaseDialog(true)
  }

  const handleAddToWatchlist = () => {
    // Implement add to watchlist functionality
    console.log('Add to watchlist')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft?.name,
        text: nft?.description,
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">NFT не найден</h1>
          <Button onClick={() => router.push('/nft')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к NFT
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Image and Audio */}
        <div className="space-y-6">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={nft.imageUrl || '/placeholder-album.jpg'}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Аудио превью
              </CardTitle>
            </CardHeader>
            <CardContent>
              <audio
                src={nft.audioUrl}
                controls
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
            <p className="text-muted-foreground mb-4">{nft.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <Badge variant={nft.listed ? 'default' : 'secondary'}>
                {nft.listed ? 'В продаже' : 'Не в продаже'}
              </Badge>
              {nft.auctionEndTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Аукцион до {formatDistanceToNow(new Date(nft.auctionEndTime), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Цена
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {nft.price} {nft.currency}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  onClick={handleBuy}
                  disabled={!nft.listed || !session}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Купить
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleAddToWatchlist}
                  disabled={!session}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Создатель</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={nft.artist.avatar} />
                  <AvatarFallback>{nft.artist.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{nft.artist.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{nft.artist.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{nft.playCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Просмотров</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{nft.likeCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Лайков</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
            <Button variant="outline" asChild>
              <a 
                href={`https://opensea.io/assets/${nft.chain}/${nft.contractAddress}/${nft.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Посмотреть на OpenSea
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Tabs */}
      <Tabs defaultValue="attributes" className="mt-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attributes">Атрибуты</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="details">Детали</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle>Атрибуты NFT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{attr.trait_type}</p>
                    <p className="text-lg font-bold">{attr.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">История транзакций будет отображаться здесь</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Технические детали</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Токен ID:</span>
                  <span className="font-mono">{nft.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Контракт:</span>
                  <span className="font-mono text-xs">{nft.contractAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Блокчейн:</span>
                  <span>{nft.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Создан:</span>
                  <span>{formatDistanceToNow(new Date(nft.createdAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Обновлен:</span>
                  <span>{formatDistanceToNow(new Date(nft.updatedAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Подтверждение покупки</CardTitle>
              <CardDescription>
                Вы уверены, что хотите купить этот NFT за {nft.price} {nft.currency}?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setShowPurchaseDialog(false)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={() => {
                  // Implement purchase logic
                  setShowPurchaseDialog(false)
                }}>
                  Подтвердить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}