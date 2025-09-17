
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui'
import { useWalletContext } from './wallet-provider'
import { useTransactions } from './wallet-provider'
import { uploadToIPFS } from '@/lib/ipfs'
import { 
  Music, 
  Upload, 
  Download, 
  DollarSign, 
  Users, 
  Play,
  Clock,
  TrendingUp,
  Crown,
  Share2,
  Eye,
  Heart,
  MoreHorizontal
} from '@/components/icons'

interface MusicNFT {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  ipfsHash: string
  metadata: {
    bpm?: number
    key?: string
    releaseDate: string
    albumArt?: string
    description?: string
  }
  price?: number
  isExplicit: boolean
  isPublished: boolean
  royaltyPercentage: number
  totalPlays: number
  totalRevenue: number
  createdAt: number
  owner: string
}

interface NFTManagerProps {
  className?: string
}

const MOCK_NFTS: MusicNFT[] = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Normal',
    genre: 'House',
    duration: 180,
    ipfsHash: 'QmX...',
    metadata: {
      bpm: 128,
      key: 'A Minor',
      releaseDate: '2024-01-15',
      albumArt: 'QmY...',
      description: 'Summer house track with uplifting vibes'
    },
    price: 100,
    isExplicit: false,
    isPublished: true,
    royaltyPercentage: 10,
    totalPlays: 15420,
    totalRevenue: 1542.50,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    owner: '...'
  },
  {
    id: '2',
    title: 'Midnight Dreams',
    artist: 'Normal Beats',
    genre: 'Downtempo',
    duration: 240,
    ipfsHash: 'QmZ...',
    metadata: {
      bpm: 90,
      key: 'F Major',
      releaseDate: '2024-02-01',
      albumArt: 'QmW...',
      description: 'Chill downtempo for late night listening'
    },
    price: 150,
    isExplicit: false,
    isPublished: true,
    royaltyPercentage: 8,
    totalPlays: 8930,
    totalRevenue: 714.40,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    owner: '...'
  }
]

export function MusicNFTManager({ className }: NFTManagerProps) {
  const { connected, publicKey } = useWalletContext()
  const { sendTransaction } = useTransactions()
  const [nfts, setNfts] = useState<MusicNFT[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [nftMetadata, setNftMetadata] = useState({
    title: '',
    artist: '',
    genre: '',
    bpm: '',
    key: '',
    description: '',
    price: '',
    royaltyPercentage: 10
  })
  const [activeTab, setActiveTab] = useState<'my-nfts' | 'all-nfts'>('my-nfts')
  const [isCreating, setIsCreating] = useState(false)

  // Загрузка NFT
  const loadNFTs = async () => {
    try {
      // Здесь нужно запросить NFT из смарт-контракта
      setNfts(MOCK_NFTS)
    } catch (err) {
      console.error('Error loading NFTs:', err)
    }
  }

  // Обработка выбора файла
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Создание NFT
  const handleCreateNFT = async () => {
    if (!selectedFile || !publicKey) return

    setIsCreating(true)
    try {
      // Загрузка файла в IPFS
      const metadata = {
        title: nftMetadata.title,
        artist: nftMetadata.artist,
        genre: nftMetadata.genre,
        duration: 180, // Временно
        releaseDate: new Date().toISOString().split('T')[0],
        bpm: nftMetadata.bpm ? parseInt(nftMetadata.bpm) : undefined,
        key: nftMetadata.key || undefined,
        description: nftMetadata.description,
        isExplicit: false,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type
      }

      // const uploadResult = await uploadToIPFS(selectedFile, metadata)
      
      // Создание NFT в блокчейне
      const instructions = [
        // Здесь нужно добавить инструкции для создания NFT
      ]

      // const transaction = await createTransaction(
      //   new (window as any).solana.Connection('https://api.devnet.solana.com'),
      //   { publicKey, signTransaction: async () => new Transaction() },
      //   instructions
      // )

      // const signature = await sendTransaction({ instructions })
      
      // Обновляем список NFT
      await loadNFTs()
      
      // Сбрасываем форму
      setSelectedFile(null)
      setNftMetadata({
        title: '',
        artist: '',
        genre: '',
        bpm: '',
        key: '',
        description: '',
        price: '',
        royaltyPercentage: 10
      })
    } catch (err) {
      console.error('Error creating NFT:', err)
    } finally {
      setIsCreating(false)
    }
  }

  // Форматирование времени
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Форматирование даты
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU')
  }

  // Рассчитать роялти
  const calculateRoyalties = (price: number, percentage: number, plays: number) => {
    return (price * percentage / 100) * (plays / 1000) // Пример расчета
  }

  // Загрузка NFT при монтировании
  useEffect(() => {
    if (connected && publicKey) {
      loadNFTs()
    }
  }, [connected, publicKey])

  const myNFTs = nfts.filter(nft => nft.owner === publicKey?.toString())
  const allNFTs = nfts

  const displayNFTs = activeTab === 'my-nfts' ? myNFTs : allNFTs

  if (!connected) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Пожалуйста, подключите кошелек для использования Music NFT Manager
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Создание NFT */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Создать NFT
            </CardTitle>
            <CardDescription>
              Загрузите ваш музыкальный трек как NFT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Выберите файл</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Название трека"
                value={nftMetadata.title}
                onChange={(e) => setNftMetadata({...nftMetadata, title: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Исполнитель"
                value={nftMetadata.artist}
                onChange={(e) => setNftMetadata({...nftMetadata, artist: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Жанр"
                value={nftMetadata.genre}
                onChange={(e) => setNftMetadata({...nftMetadata, genre: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="BPM"
                value={nftMetadata.bpm}
                onChange={(e) => setNftMetadata({...nftMetadata, bpm: e.target.value})}
                className="p-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Тональность"
                value={nftMetadata.key}
                onChange={(e) => setNftMetadata({...nftMetadata, key: e.target.value})}
                className="p-2 border rounded-md"
              />
            </div>

            <textarea
              placeholder="Описание"
              value={nftMetadata.description}
              onChange={(e) => setNftMetadata({...nftMetadata, description: e.target.value})}
              className="w-full p-2 border rounded-md h-20"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Цена (SOL)"
                value={nftMetadata.price}
                onChange={(e) => setNftMetadata({...nftMetadata, price: e.target.value})}
                className="p-2 border rounded-md"
              />
              <select
                value={nftMetadata.royaltyPercentage}
                onChange={(e) => setNftMetadata({...nftMetadata, royaltyPercentage: parseInt(e.target.value)})}
                className="p-2 border rounded-md"
              >
                <option value="5">5% роялти</option>
                <option value="10">10% роялти</option>
                <option value="15">15% роялти</option>
              </select>
            </div>

            <Button
              onClick={handleCreateNFT}
              disabled={isCreating || !selectedFile}
              className="w-full"
            >
              {isCreating ? 'Создание...' : 'Создать NFT'}
            </Button>
          </CardContent>
        </Card>

        {/* Список NFT */}
        <div className="md:w-2/3">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'my-nfts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('my-nfts')}
            >
              Мои NFT
            </Button>
            <Button
              variant={activeTab === 'all-nfts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all-nfts')}
            >
              Все NFT
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayNFTs.map((nft) => (
              <Card key={nft.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{nft.title}</CardTitle>
                      <CardDescription>{nft.artist}</CardDescription>
                    </div>
                    <Badge variant="secondary">{nft.genre}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(nft.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {nft.totalPlays.toLocaleString()}
                      </div>
                    </div>

                    {nft.metadata.albumArt && (
                      <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                        <Music className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Роялти</div>
                        <div className="font-medium">{nft.royaltyPercentage}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Доход</div>
                        <div className="font-medium text-green-600">
                          {nft.totalRevenue.toFixed(2)} SOL
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Воспроизвести
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}