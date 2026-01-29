"use client"

import Link from "next/link"
import { Twitter, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function TopNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname === "/reels") return null

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-50 px-4">
      <div className="w-8" /> {/* Spacer */}
      <Link href="/" className="flex items-center gap-2">
           <Twitter className="w-6 h-6 text-primary" fill="currentColor" />
           <span className="text-lg font-bold">SocialApp</span>
      </Link>
      {session ? (
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-8" />
      )}
    </header>
  )
}
