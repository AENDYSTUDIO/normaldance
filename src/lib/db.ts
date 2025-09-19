import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: { 
      db: { 
        url: process.env.DATABASE_URL || 'file:./prisma/db/custom.db' 
      } 
    },
    errorFormat: 'minimal'
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Экспорт для обратной совместимости
export const prisma = db