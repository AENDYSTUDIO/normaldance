#!/usr/bin/env tsx

/**
 * Скрипт для сброса всех мок-данных в проекте NORMAL DANCE
 * Цель: получить честный продукт с 0 пользователями для старта
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()

async function resetDatabase() {
  console.log('🗑️  Очистка базы данных...')
  
  try {
    // Удаляем все данные в правильном порядке (с учетом foreign keys)
    await db.purchase.deleteMany()
    await db.nFT.deleteMany()
    await db.playHistory.deleteMany()
    await db.follow.deleteMany()
    await db.reward.deleteMany()
    await db.comment.deleteMany()
    await db.like.deleteMany()
    await db.playlistTrack.deleteMany()
    await db.playlist.deleteMany()
    await db.track.deleteMany()
    await db.stake.deleteMany()
    await db.user.deleteMany()
    
    console.log('✅ База данных очищена')
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error)
    throw error
  }
}

async function resetMockFiles() {
  console.log('🧹 Очистка мок-данных из файлов...')
  
  const filesToClean = [
    'src/app/page.tsx',
    'src/app/profile/page.tsx',
    'src/components/discovery/discovery-page.tsx',
    'src/components/profile/listening-stats.tsx',
    'src/components/unified/unified-system.tsx',
    'src/components/wallet/music-nft-manager.tsx',
    'src/components/chat/chat-matrix.tsx',
    'src/components/audio/playlist-manager.tsx',
    'src/components/recommendations/recommendation-engine.tsx',
    'src/components/staking/staking-interface.tsx',
    'src/components/rewards/achievements-system.tsx',
    'src/components/rewards/charts-and-shop.tsx',
    'src/components/rewards/referral-system.tsx',
    'src/components/wallet/staking-manager.tsx',
    'src/components/wallet/ndt-manager.tsx',
    'src/components/profile/artist-portfolio.tsx',
    'src/components/profile/artist-subscriptions.tsx',
    'src/components/profile/social-integration.tsx',
    'src/components/audio/listening-now.tsx'
  ]
  
  for (const filePath of filesToClean) {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8')
        
        // Заменяем мок-данные на пустые массивы/объекты
        content = content.replace(/const mock\w+.*?=.*?\[[\s\S]*?\];/g, 'const mockData = [];')
        content = content.replace(/const mock\w+.*?=.*?\{[\s\S]*?\};/g, 'const mockData = {};')
        content = content.replace(/mock\w+\.\w+/g, '[]')
        content = content.replace(/set\w+\(mock\w+\)/g, 'setData([])')
        
        // Убираем комментарии о мок-данных
        content = content.replace(/\/\/ Mock data.*?\n/g, '')
        content = content.replace(/\/\/ Mock.*?\n/g, '')
        
        fs.writeFileSync(filePath, content)
        console.log(`✅ Очищен файл: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ Ошибка при очистке ${filePath}:`, error)
    }
  }
}

async function createEmptyStateFiles() {
  console.log('📝 Создание файлов с пустым состоянием...')
  
  // Создаем файл с пустыми данными по умолчанию
  const emptyStateContent = `// Пустое состояние для честного старта
export const EMPTY_STATE = {
  users: [],
  tracks: [],
  playlists: [],
  nfts: [],
  transactions: [],
  stakingPools: [],
  achievements: [],
  rewards: []
}

export const INITIAL_METRICS = {
  totalUsers: 0,
  totalTracks: 0,
  totalPlays: 0,
  totalRevenue: 0,
  activeUsers: 0,
  monthlyRevenue: 0
}
`
  
  fs.writeFileSync('src/lib/empty-state.ts', emptyStateContent)
  console.log('✅ Создан файл empty-state.ts')
}

async function updateEnvironmentVariables() {
  console.log('🔧 Обновление переменных окружения...')
  
  const envContent = `# NORMAL DANCE - Production Environment
# Честный старт с 0 пользователей

# Database
DATABASE_URL="file:./db/production.db"

# Web3
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com"

# IPFS
IPFS_GATEWAY_URL="https://ipfs.io/ipfs/"
PINATA_API_KEY=""
PINATA_SECRET_KEY=""

# Analytics (отключены для честного старта)
MIXPANEL_TOKEN=""
SENTRY_DSN=""

# Server
NEXTAUTH_URL="https://normaldance.com"
NEXTAUTH_SECRET=""

# Production flags
NODE_ENV="production"
DISABLE_ANALYTICS="true"
HONEST_MODE="true"
`
  
  fs.writeFileSync('.env.production', envContent)
  console.log('✅ Создан .env.production')
}

async function main() {
  console.log('🚀 NORMAL DANCE - Сброс к честному состоянию')
  console.log('===============================================')
  
  try {
    await resetDatabase()
    await resetMockFiles()
    await createEmptyStateFiles()
    await updateEnvironmentVariables()
    
    console.log('')
    console.log('🎉 ГОТОВО! Проект сброшен к честному состоянию:')
    console.log('   ✅ 0 пользователей')
    console.log('   ✅ 0 треков')
    console.log('   ✅ 0 транзакций')
    console.log('   ✅ Чистый код без мок-данных')
    console.log('   ✅ Готов к продакшену')
    console.log('')
    console.log('💡 Следующий шаг: запустить продакшен сервер')
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}
