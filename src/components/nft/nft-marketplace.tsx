'use client'

import { useState, useEffect } from 'react'
import { nftMarketplaces } from '@/lib/integrations/nft-marketplaces'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  ShoppingCart, 
  Eye, 
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Star,
  Plus,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface NFTMarketplaceProps {
  userId: string
}

interface NFTCardProps {
  nft: any
  onBuy: (nft: any) => void
  onAddToWatchlist: (nft: any) => void
}

interface CollectionCardProps {
  collection: any
  onSelect: (collection: any) => void
}

interface MarketplaceSelectorProps {
  selectedMarketplace: string
  onMarketplaceChange: (marketplace: string) => void
}

export function NFTMarketplace({ userId }: NFTMarketplaceProps) {
  const [selectedMarketplace, setSelectedMarketplace] = useState('opensea')
  const [nfts, setNfts] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [trendingNFTs, setTrendingNFTs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [userPortfolio, setUserPortfolio] = useState<any>(null)

  // Загрузка данных при монтировании
  useEffect(() => {
    loadMarketplaceData()
    loadUserPortfolio()
  }, [selectedMarketplace])

  // Загрузка данных маркетплейса
  const loadMarketplaceData = async () => {
    setLoading(true)
    try {
      const [collectionsData, nftsData, trendingData] = await Promise.all([
        nftMarketplaces.getCollections(selectedMarketplace, 20),
        nftMarketplaces.getNFTs(selectedMarketplace, selectedCollection || '', 20),
        nftMarketplaces.getTrendingNFTs(selectedMarketplace, 10)
      ])
      
      setCollections(collectionsData)
      setNfts(nftsData)
      setTrendingNFTs(trendingData)
    } catch (error) {
      console.error('Error loading marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка портфолио пользователя
  const loadUserPortfolio = async () => {
    try {
      const portfolio = await nftMarketplaces.getUserPortfolio(userId)
      setUserPortfolio(portfolio)
    } catch (error) {
      console.error('Error loading user portfolio:', error)
    }
  }

  // Обработка покупки NFT
  const handleBuyNFT = async (nft: any) => {
    try {
      const result = await nftMarketplaces.purchaseNFT(
        selectedMarketplace,
        nft.id,
        userId,
        nft.price || 0
      )
      
      if (result.success) {
        alert(`NFT успешно куплен! Транзакция: ${result.transactionHash}`)
        await loadUserPortfolio()
        await loadMarketplaceData()
      } else {
        alert(`Ошибка покупки: ${result.error}`)
      }
    } catch (error) {
      console.error('Error buying NFT:', error)
      alert('Произошла ошибка при покупке NFT')
    }
  }

  // Обработка добавления в избранное
  const handleAddToWatchlist = (nft: any) => {
    // Здесь будет логика добавления в избранное
    console.log('Added to watchlist:', nft)
  }

  // Обработка поиска
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadMarketplaceData()
      return
    }

    setLoading(true)
    try {
      const searchResults = await nftMarketplaces.searchNFTs(selectedMarketplace, searchQuery, 20)
      setNfts(searchResults)
    } catch (error) {
      console.error('Error searching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Обработка выбора коллекции
  const handleCollectionSelect = async (collection: any) => {
    setSelectedCollection(collection.contractAddress)
    setLoading(true)
    try {
      const nftsData = await nftMarketplaces.getNFTs(selectedMarketplace, collection.contractAddress, 20)
      setNfts(nftsData)
    } catch (error) {
      console.error('Error loading collection NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT Маркетплейс</h1>
        <p className="text-muted-foreground">Исследуйте, покупайте и продавайте музыкальные NFT</p>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explore">Исследовать</TabsTrigger>
          <TabsTrigger value="collections">Коллекции</TabsTrigger>
          <TabsTrigger value="trending">Тренды</TabsTrigger>
          <TabsTrigger value="portfolio">Мой портфель</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 items-center">
              <MarketplaceSelector 
                selectedMarketplace={selectedMarketplace}
                onMarketplaceChange={setSelectedMarketplace}
              />
              <div className="flex gap-2">
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

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск NFT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onBuy={handleBuyNFT}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onSelect={handleCollectionSelect}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Трендовые NFT
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onBuy={handleBuyNFT}
                onAddToWatchlist={handleAddToWatchlist}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {userPortfolio ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Всего NFT</p>
                        <p className="text-2xl font-bold">{userPortfolio.nfts.length}</p>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>NFT</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Общая стоимость</p>
                        <p className="text-2xl font-bold">{userPortfolio.totalValue.toFixed(2)} ETH</p>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Коллекций</p>
                        <p className="text-2xl font-bold">{userPortfolio.collections.length}</p>
                      </div>
                      <Users className="h-12 w-12 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Мои NFT</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPortfolio.nfts.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      onBuy={() => {}} // Уже куплено
                      onAddToWatchlist={handleAddToWatchlist}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">У вас еще нет NFT в портфеле</p>
                <Button onClick={() => document.querySelector('[value="explore"]')?.click()}>
                  Купить первый NFT
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Компонент выбора маркетплейса
function MarketplaceSelector({ selectedMarketplace, onMarketplaceChange }: MarketplaceSelectorProps) {
  const marketplaces = nftMarketplaces.getAvailableMarketplaces()

  return (
    <Select value={selectedMarketplace} onValueChange={onMarketplaceChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите маркетплейс" />
      </SelectTrigger>
      <SelectContent>
        {marketplaces.map((marketplace) => (
          <SelectItem key={marketplace.id} value={marketplace.id}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{marketplace.name.charAt(0)}</span>
              </div>
              {marketplace.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Компонент карточки NFT
function NFTCard({ nft, onBuy, onAddToWatchlist }: NFTCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={nft.imageUrl || '/placeholder-album.jpg'}
          alt={nft.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={() => onAddToWatchlist(nft)}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{nft.name}</DialogTitle>
                <DialogDescription>
                  Детальная информация о NFT
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={nft.imageUrl || '/placeholder-album.jpg'}
                  alt={nft.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Токен ID</p>
                    <p className="font-mono">{nft.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Контракт</p>
                    <p className="font-mono text-xs">{nft.contractAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Цена</p>
                    <p className="font-bold">{nft.price} {nft.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Статус</p>
                    <Badge variant={nft.listed ? 'default' : 'secondary'}>
                      {nft.listed ? 'В продаже' : 'Не в продаже'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onBuy(nft)} 
                    disabled={!nft.listed}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Купить
                  </Button>
                  <Button variant="outline" asChild>
                    <a 
                      href={`https://opensea.io/assets/${nft.chain}/${nft.contractAddress}/${nft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 truncate">{nft.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {nft.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-xs">NFT</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
            </span>
          </div>
          
          <div className="text-right">
            <p className="font-bold">{nft.price} {nft.currency}</p>
            {nft.auctionEndTime && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(nft.auctionEndTime), { 
                  addSuffix: true, 
                  locale: ru 
                })}
              </p>
            )}
          </div>
        </div>
        
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {nft.attributes.slice(0, 3).map((attr: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
            {nft.attributes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{nft.attributes.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Компонент карточки коллекции
function CollectionCard({ collection, onSelect }: CollectionCardProps) {
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
      </CardContent>
    </Card>
  )
}