import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: { db: { url: process.env.DATABASE_URL } },
    errorFormat: 'minimal',
    // Non-public option used by Prisma to control connection timeout.
    // Accepted in practice though marked internal.
    // Keeps container startup from hanging forever on DB unavailability.
    // @ts-ignore
    __internal: { connectTimeout: 10000 }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db