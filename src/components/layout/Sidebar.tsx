"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Clapperboard, MessageCircle, Heart, PlusSquare, User, Menu, Twitter, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Clapperboard, label: "Reels", href: "/reels" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Heart, label: "Notifications", href: "/notifications" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAuthPage = pathname === "/login" || pathname === "/register"
  if (isAuthPage) return null

  return (
    <aside className="hidden md:flex flex-col w-[244px] h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 px-4 py-6 bg-background">
      <div className="mb-8 px-4">
        <Link href="/" className="flex items-center gap-2">
           <Twitter className="w-8 h-8 text-primary" fill="currentColor" />
           <span className="text-xl font-bold hidden xl:block">SocialApp</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
                isActive && "font-bold"
              )}
            >
              <Icon className={cn("w-7 h-7", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
              <span className={cn("text-lg hidden xl:block", isActive ? "font-bold" : "font-normal")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {session && (
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-4 p-3 w-full rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left text-red-500"
          >
            <LogOut className="w-7 h-7" />
            <span className="text-lg hidden xl:block font-medium">Logout</span>
          </button>
        )}

        <button className="flex items-center gap-4 p-3 w-full rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left">
          <Menu className="w-7 h-7" />
          <span className="text-lg hidden xl:block">More</span>
        </button>
      </div>
    </aside>
  )
}
