import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
// import SpotifyProvider from 'next-auth/providers/spotify'
// import AppleProvider from 'next-auth/providers/apple'
import { SiweMessage } from 'siwe'
import { db } from './db'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // Web3 аутентификация через Solana кошелек
    CredentialsProvider({
      id: 'solana',
      name: 'Solana',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null
          }

          const siweMessage = new SiweMessage(credentials.message)
          const message = await siweMessage.verify({ signature: credentials.signature })

          if (message.success) {
            // Проверяем, существует ли пользователь, и создаем при необходимости
            let user = await db.user.findFirst({
              where: {
                wallet: message.data.address
              }
            })

            if (!user) {
              user = await db.user.create({
                data: {
                  wallet: message.data.address,
                  username: `user_${message.data.address.slice(0, 8)}`,
                  email: `${message.data.address}@solana.local`,
                  isArtist: false,
                  level: 'BRONZE'
                }
              })
            }

            return {
              id: user.id,
              wallet: user.wallet,
              username: user.username,
              email: user.email,
              isArtist: user.isArtist,
              level: user.level
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),

    // OAuth провайдеры (временно отключены)
    // SpotifyProvider({
    //   clientId: process.env.SPOTIFY_CLIENT_ID!,
    //   clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Обработка Web3 аутентификации
      if (account?.provider === 'solana' && user) {
        token.wallet = (user as any).wallet
        token.username = (user as any).username
        token.isArtist = (user as any).isArtist
        token.level = (user as any).level
      }
      
      // Обработка OAuth аутентификации
      if (account?.provider === 'spotify' && profile) {
        token.spotifyId = profile.id
        token.spotifyProfile = profile
      }
      
      if (account?.provider === 'apple' && profile) {
        token.appleId = profile.sub
        token.appleProfile = profile
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.wallet = token.wallet as string
        session.user.username = token.username as string
        session.user.isArtist = token.isArtist as boolean
        session.user.level = token.level as string
        
        // Добавляем OAuth данные в сессию
        session.user.spotifyId = token.spotifyId as string
        session.user.spotifyProfile = token.spotifyProfile as any
        session.user.appleId = token.appleId as string
        session.user.appleProfile = token.appleProfile as any
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    // Можно добавить кастомные страницы для разных провайдеров
  },
  // Настройка безопасности
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Хелперы для работы с аутентификацией
export async function getServerSession() {
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerSession()
  if (!session?.user?.id) return null
  
  return await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      wallet: true,
      isArtist: true,
      level: true,
      createdAt: true,
      updatedAt: true,
    }
  })
}

// Функция для обновления уровня пользователя на основе активности
export async function updateUserLevel(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          tracks: true,
          likes: true,
          followers: true,
        }
      }
    }
  })

  if (!user) return

  let newLevel = user.level

  // Логика обновления уровня
  if (user._count.tracks >= 50 && user.level === 'BRONZE') {
    newLevel = 'SILVER'
  } else if (user._count.tracks >= 200 && user.level === 'SILVER') {
    newLevel = 'GOLD'
  } else if (user._count.tracks >= 500 && user.level === 'GOLD') {
    newLevel = 'PLATINUM'
  }

  if (newLevel !== user.level) {
    await db.user.update({
      where: { id: userId },
      data: { level: newLevel }
    })
  }
}

// Функция для проверки прав доступа
export async function checkUserPermission(userId: string, requiredLevel: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { level: true }
  })

  if (!user) return false

  const levelHierarchy = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
  const userLevelIndex = levelHierarchy.indexOf(user.level)
  const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel)

  return userLevelIndex >= requiredLevelIndex
}

// Функция для создания пользователя через OAuth
export async function createOAuthUser(profile: any, provider: string) {
  let username = profile.login || profile.email?.split('@')[0]
  let email = profile.email || `${profile.id}@${provider}.com`
  
  // Генерируем уникальный username если уже существует
  let existingUser = await db.user.findFirst({ where: { username } })
  let counter = 1
  while (existingUser) {
    username = `${profile.login || profile.id}_${counter}`
    existingUser = await db.user.findFirst({ where: { username } })
    counter++
  }

  return await db.user.create({
    data: {
      username,
      email,
      isArtist: false,
      level: 'BRONZE',
      // Можно добавить дополнительные поля в зависимости от провайдера
      ...(provider === 'spotify' && { spotifyId: profile.id }),
      ...(provider === 'apple' && { appleId: profile.sub }),
    }
  })
}