"use client"

import { usePathname } from "next/navigation"
import { TopNav } from "./TopNav"
import { cn } from "@/lib/utils"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isReels = pathname === "/reels"

  return (
    <main className={cn(
        "flex-1 w-full max-w-2xl mx-auto md:border-r border-gray-200 dark:border-gray-800 relative",
        "pb-16 md:pb-0"
    )}>
      {!isReels && <TopNav />}
      <div className={cn(!isReels && "pt-14 md:pt-0")}>
        {children}
      </div>
    </main>
  )
}
