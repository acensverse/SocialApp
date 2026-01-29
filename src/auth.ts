import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { compare } from "bcryptjs"
import fs from "fs"
import path from "path"

const providers: any[] = [
  Credentials({
    async authorize(credentials) {
      const logFile = path.join(process.cwd(), "auth-debug.log")
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Authorize START: ${credentials?.email}\n`)

      if (!credentials?.email || !credentials?.password) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Authorize ERROR: Missing credentials\n`)
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string }
      })

      if (!user || !user.password) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Authorize ERROR: User not found or no password\n`)
        return null
      }

      const isPasswordCorrect = await compare(
        credentials.password as string,
        user.password
      )

      if (!isPasswordCorrect) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Authorize ERROR: Incorrect password\n`)
        return null
      }

      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Authorize SUCCESS: ${user.id}\n`)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    }
  })
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers,
})
