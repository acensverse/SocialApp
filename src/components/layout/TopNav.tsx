"use client"

import Link from "next/link"
import { Twitter, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function TopNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname === "/reels") return null

  return null
}
