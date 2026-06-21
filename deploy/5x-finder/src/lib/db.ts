import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization: don't create PrismaClient at module import time.
// During `next build`, the native Prisma binary may crash on Vercel's build
// machines. By deferring creation to request-time, the build succeeds.
let _db: PrismaClient | undefined

export function getDb(): PrismaClient {
  if (_db) return _db
  _db = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
  return _db
}
