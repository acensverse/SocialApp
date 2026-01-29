// Forced reload to pick up new Prisma Client
import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables!")
}

const adapter = new PrismaLibSql({
    url: databaseUrl || "file:./dev.db"
})

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
