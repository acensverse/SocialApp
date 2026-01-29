import { prisma } from "@/lib/db"
import { ExploreGrid } from "@/components/explore/ExploreGrid"

export default async function ExplorePage() {
  const posts = await prisma.post.findMany({
    where: {
      mediaUrl: { not: null }
    },
    select: {
      id: true,
      mediaUrl: true,
      mediaType: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Filter out any entries where mediaUrl is somehow null despite where clause (Prisma types)
  const items = posts.map(post => ({
    id: post.id,
    mediaUrl: post.mediaUrl!,
    mediaType: (post.mediaType as "image" | "video") || 'image'
  }))

  return (
    <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">Explore</h1>
      </div>
      
      {items.length > 0 ? (
        <ExploreGrid items={items} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg">Nothing to explore yet.</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}
