"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, Image as ImageIcon, Search } from "lucide-react"
import { searchUsers } from "@/actions/user"
import { useState, useEffect } from "react"

interface ExploreItem {
  id: string
  mediaUrl: string
  mediaType: "video" | "image"
}

interface ExploreGridProps {
  items: ExploreItem[]
}

interface SearchResult {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export function ExploreGrid({ items }: ExploreGridProps) {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchUsers(query)
          setSearchResults(results)
        } catch (error) {
          console.error(error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search items or people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Search Results */}
      {query.length >= 2 && (
        <div className="bg-background rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No users found for &quot;{query}&quot;</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-900">
              {searchResults.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <Image
                    src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm text-foreground">{user.name || "User"}</p>
                    <p className="text-xs text-gray-500">@{user.email?.split("@")[0] || "user"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explore Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
      {items.map((item) => {
        const href =
          item.mediaType === "video"
            ? `/reels?id=${item.id}`
            : `/post?id=${item.id}`

        return (
          <Link
            key={item.id}
            href={href}
            className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer group"
          >
            {item.mediaType === "video" ? (
              <>
                <video
                  src={item.mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute top-2 right-2 z-10">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </>
            ) : (
              <>
                <Image
                  src={item.mediaUrl}
                  alt="Explore"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 z-10">
                  <ImageIcon className="w-4 h-4 text-white opacity-80" />
                </div>
              </>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )
      })}
      </div>
    </div>
  )
}
