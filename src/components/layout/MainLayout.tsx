"use client"

import { usePathname } from "next/navigation"
import { TopNav } from "./TopNav"
import { cn } from "@/lib/utils"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isReels = pathname === "/reels"
  const isMessages = pathname?.startsWith("/messages")

  return (
    <main className={cn(
        "flex-1 w-full relative",
        !isMessages && "max-w-2xl mx-auto",
        "pb-16 md:pb-0"
    )}>
      {!isReels && <TopNav />}
      <div className={cn(!isReels && "pt-0")}>
        {children}
      </div>
    </main>
  )
}
