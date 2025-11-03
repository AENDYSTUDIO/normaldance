import { SecureLogger } from '@/lib/security/secure-logger';
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui'
import { 
  MessageCircle, 
  Users, 
  Globe, 
  Music, 
  Crown,
  Shield,
  Star,
  Zap,
  Vote,
  Send,
  MoreHorizontal,
  Flag,
  Trophy,
  Coins,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share,
  Pin,
  Hash,
  AtSign,
  Bot,
  TrendingUp,
  Target,
  Gift,
  Wallet
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: number
  type: 'message' | 'vote' | 'poll' | 'system' | 'bot'
  reactions: MessageReaction[]
  isPinned: boolean
  cost: number // T1 cost for sending
  role: UserRole
  metadata?: {
    trackId?: string
    amount?: number
    pollId?: string
    voteType?: string
  }
}

interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

interface ChatRoom {
  id: string
  type: 'genre' | 'club' | 'country'
  name: string
  icon: string
  description: string
  memberCount: number
  isActive: boolean
  pinnedMessages: string[]
  recentActivity: number
}

interface UserRole {
  type: 'voter' | 'captain' | 'moderator' | 'artist'
  permissions: string[]
  description: string
}

interface Poll {
  id: string
  question: string
  options: string[]
  votes: Record<string, number>
  endTime: number
  creator: string
  cost: number
  isActive: boolean
}

interface ChatMatrixProps {
  className?: string
}

export function ChatMatrix({ className }: ChatMatrixProps) {
  const [activeChat, setActiveChat] = useState<'genre' | 'club' | 'country'>('genre')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showUniversalChannel, setShowUniversalChannel] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [dailySpend, setDailySpend] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data - в реальном приложении будет загружаться из API
  const chatRooms: Record<string, ChatRoom> = {
    genre: {
      id: 'genre-pop',
      type: 'genre',
      name: 'POP',
      icon: '🎵',
      description: 'Поп-музыка и хиты',
      memberCount: 1247,
      isActive: true,
      pinnedMessages: [],
      recentActivity: Date.now() - 30000
    },
    club: {
      id: 'club-cyber-beats',
      type: 'club',
      name: 'Cyber Beats Club',
      icon: '🏛️',
      description: 'Электронная музыка нового поколения',
      memberCount: 127,
      isActive: true,
      pinnedMessages: [],
      recentActivity: Date.now() - 60000
    },
    country: {
      id: 'country-brazil',
      type: 'country',
      name: '🇧🇷 Brazil',
      icon: '🇧🇷',
      description: 'Бразильская музыкальная сцена',
      memberCount: 892,
      isActive: true,
      pinnedMessages: [],
      recentActivity: Date.now() - 120000
    }
  }

  // Mock messages
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      userId: 'user1',
      username: 'Luna Nova',
      avatar: '/avatars/luna.jpg',
      content: 'Привет всем! Новый трек готов к релизу 🚀',
      timestamp: Date.now() - 300000,
      type: 'message',
      reactions: [
        { emoji: '👍', count: 12, users: ['user2', 'user3'] },
        { emoji: '🔥', count: 8, users: ['user4', 'user5'] }
      ],
      isPinned: false,
      cost: 0.001,
      role: { type: 'artist', permissions: ['vote', 'create_poll'], description: 'Артист' }
    },
    {
      id: '2',
      userId: 'bot',
      username: 'TIER1 Bot',
      avatar: '/avatars/bot.jpg',
      content: 'Sprint Streams: BASS 31% | POP 29% | нужно +2%, чтобы догнать!',
      timestamp: Date.now() - 240000,
      type: 'bot',
      reactions: [],
      isPinned: false,
      cost: 0,
      role: { type: 'voter', permissions: [], description: 'Бот' }
    },
    {
      id: '3',
      userId: 'user2',
      username: 'Cyber Pulse',
      avatar: '/avatars/cyber.jpg',
      content: '/vote boost track-123',
      timestamp: Date.now() - 180000,
      type: 'vote',
      reactions: [
        { emoji: '✅', count: 15, users: ['user1', 'user3', 'user4'] },
        { emoji: '❌', count: 3, users: ['user5'] }
      ],
      isPinned: false,
      cost: 0.001,
      role: { type: 'voter', permissions: ['vote'], description: 'Голосующий' },
      metadata: { trackId: 'track-123', voteType: 'boost' }
    },
    {
      id: '4',
      userId: 'user3',
      username: 'Club Captain',
      avatar: '/avatars/captain.jpg',
      content: 'Наш пул 4,200 T1. До золота не хватает 300 T1. /vote fund 10',
      timestamp: Date.now() - 120000,
      type: 'message',
      reactions: [
        { emoji: '💰', count: 7, users: ['user1', 'user2'] }
      ],
      isPinned: true,
      cost: 0.001,
      role: { type: 'captain', permissions: ['vote', 'create_poll', 'platform_poll'], description: 'Капитан клуба' }
    },
    {
      id: '5',
      userId: 'user4',
      username: 'Brazil Fan',
      avatar: '/avatars/brazil.jpg',
      content: '🇧🇷 Взнос армия завершён! Мы 2-е в мире. Держим tempo!',
      timestamp: Date.now() - 60000,
      type: 'message',
      reactions: [
        { emoji: '🇧🇷', count: 23, users: ['user1', 'user2', 'user3'] },
        { emoji: '🔥', count: 15, users: ['user4', 'user5'] }
      ],
      isPinned: false,
      cost: 0.001,
      role: { type: 'moderator', permissions: ['vote', 'moderate'], description: 'Модератор страны' }
    }
  ]

  useEffect(() => {
    setMessages(mockMessages)
    setUserRole({ type: 'voter', permissions: ['vote'], description: 'Голосующий' })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || dailySpend >= 1) return

    setIsLoading(true)
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        username: 'You',
        avatar: '/avatars/current.jpg',
        content: newMessage,
        timestamp: Date.now(),
        type: 'message',
        reactions: [],
        isPinned: false,
        cost: 0.001,
        role: userRole!
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')
      setDailySpend(prev => prev + 0.001)

      // Здесь будет API вызов для отправки сообщения
      SecureLogger.log('Sending message:', newMessage)
    } catch (error) {
      SecureLogger.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (messageId: string, voteType: string, trackId?: string) => {
    try {
      // Здесь будет API вызов для голосования
      SecureLogger.log('Voting:', { messageId, voteType, trackId })
      
      // Обновляем сообщение с результатами голосования
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = [...msg.reactions]
          const existingReaction = newReactions.find(r => r.emoji === '✅')
          
          if (existingReaction) {
            existingReaction.count += 1
            existingReaction.users.push('current-user')
          } else {
            newReactions.push({ emoji: '✅', count: 1, users: ['current-user'] })
          }
          
          return { ...msg, reactions: newReactions }
        }
        return msg
      }))
    } catch (error) {
      SecureLogger.error('Error voting:', error)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = [...msg.reactions]
          const existingReaction = newReactions.find(r => r.emoji === emoji)
          
          if (existingReaction) {
            existingReaction.count += 1
            existingReaction.users.push('current-user')
          } else {
            newReactions.push({ emoji, count: 1, users: ['current-user'] })
          }
          
          return { ...msg, reactions: newReactions }
        }
        return msg
      }))
    } catch (error) {
      SecureLogger.error('Error adding reaction:', error)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role.type) {
      case 'captain': return <Crown className="h-4 w-4 text-yellow-400" />
      case 'moderator': return <Shield className="h-4 w-4 text-blue-400" />
      case 'artist': return <Star className="h-4 w-4 text-purple-400" />
      default: return <Users className="h-4 w-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role.type) {
      case 'captain': return 'text-yellow-400'
      case 'moderator': return 'text-blue-400'
      case 'artist': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const formatMessage = (message: ChatMessage) => {
    if (message.type === 'vote') {
      return (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Vote className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-semibold">Голосование</span>
          </div>
          <p className="text-white">{message.content}</p>
          {message.metadata?.trackId && (
            <div className="mt-2 text-sm text-gray-400">
              Трек: {message.metadata.trackId}
            </div>
          )}
        </div>
      )
    }
    
    if (message.type === 'bot') {
      return (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-semibold">TIER1 Bot</span>
          </div>
          <p className="text-white">{message.content}</p>
        </div>
      )
    }
    
    return <p className="text-white">{message.content}</p>
  }

  return (
    <div className={cn('h-full flex flex-col bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">Чат-матрица</h1>
          <Badge variant="outline" className="text-green-400 border-green-400">
            DAO-управление
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-400">
            Потрачено сегодня: {dailySpend.toFixed(3)} T1
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUniversalChannel(!showUniversalChannel)}
          >
            <Hash className="h-4 w-4 mr-2" />
            {showUniversalChannel ? 'Развернуть' : 'Универсальный'}
          </Button>
        </div>
      </div>

      {/* Chat Tabs */}
      <div className="flex border-b border-gray-700">
        {Object.entries(chatRooms).map(([key, room]) => (
          <button
            key={key}
            onClick={() => setActiveChat(key as any)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 p-4 transition-all',
              activeChat === key
                ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <span className="text-lg">{room.icon}</span>
            <span className="font-semibold">{room.name}</span>
            <Badge variant="outline" className="text-xs">
              {room.memberCount}
            </Badge>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {message.username.charAt(0)}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-white">{message.username}</span>
                {getRoleIcon(message.role)}
                <span className={cn('text-xs', getRoleColor(message.role))}>
                  {message.role.description}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.isPinned && (
                  <Pin className="h-3 w-3 text-yellow-400" />
                )}
              </div>
              
              <div className="mb-2">
                {formatMessage(message)}
              </div>
              
              {/* Reactions */}
              {message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => handleReaction(message.id, reaction.emoji)}
                      className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 rounded-full px-2 py-1 text-sm transition-colors"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-gray-300">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {message.type === 'vote' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(message.id, 'approve', message.metadata?.trackId)}
                    className="text-green-400 border-green-400 hover:bg-green-400/10"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    За
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction(message.id, '👍')}
                  className="text-gray-400 hover:text-white"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction(message.id, '🔥')}
                  className="text-gray-400 hover:text-white"
                >
                  <Zap className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction(message.id, '❤️')}
                  className="text-gray-400 hover:text-white"
                >
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение... (0.001 T1)"
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={dailySpend >= 1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || dailySpend >= 1 || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {dailySpend >= 1 && (
          <div className="mt-2 text-sm text-yellow-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Достигнут дневной лимит трат (1 T1). Завтра снова сможете писать.
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-400">
          Каждое сообщение стоит 0.001 T1. До 1 T1 в день возвращается при отсутствии жалоб.
        </div>
      </div>
    </div>
  )
}

// Hook for using chat matrix
export function useChatMatrix() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string, chatType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, chatType })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        return true
      }
      return false
    } catch (error) {
      SecureLogger.error('Error sending message:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const vote = async (messageId: string, voteType: string, metadata?: any) => {
    try {
      const response = await fetch('/api/chat/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, voteType, metadata })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, ...data.updatedMessage } : msg
        ))
        return true
      }
      return false
    } catch (error) {
      SecureLogger.error('Error voting:', error)
      return false
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    vote
  }
}
