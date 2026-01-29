"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import fs from "fs"
import path from "path"

export async function register(formData: FormData) {
  const logFile = path.join(process.cwd(), "auth-debug.log")
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register START: ${email}\n`)

    if (!email || !password) {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register ERROR: Missing email or password\n`)
      return { error: "Email and password are required" }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register ERROR: User exists ${email}\n`)
      return { error: "User already exists" }
    }

    const hashedPassword = await hash(password, 12)
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Password hashed\n`)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] User created in DB: ${user.id}\n`)

    // Auto-login after registration
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Calling signIn...\n`)
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/profile"
    })

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] signIn returned\n`)
    return { success: true }
  } catch (error) {
    const err = error as Error & { digest?: string }
    if (err.digest?.startsWith("NEXT_REDIRECT") || err.message === "NEXT_REDIRECT") {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register SUCCESS (Redirecting)\n`)
        throw error
    }
    
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register CATCH: ${err.message}\nStack: ${err.stack}\n`)
    
    if (error instanceof AuthError) {
        return { error: "Registration successful but login failed. Please sign in manually." }
    }

    console.error("Registration error:", err)
    return { error: err.message || "Failed to register" }
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/"
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}
