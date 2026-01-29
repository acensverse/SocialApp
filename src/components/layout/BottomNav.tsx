"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Clapperboard, PlusSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

const bottomNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Clapperboard, label: "Reels", href: "/reels" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-50 px-2 pb-safe">
      {bottomNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 flex-1"
          >
            <Icon 
              className={cn(
                "w-7 h-7 transition-all", 
                isActive ? "text-primary stroke-[3px]" : "text-gray-500 stroke-[2px]"
              )} 
            />
          </Link>
        )
      })}
    </nav>
  )
}
