import { PostCard } from "./PostCard"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function Feed({ authorId }: { authorId?: string }) {
  const session = await auth()
  
  const posts = await prisma.post.findMany({
    where: authorId ? { authorId } : {},
    select: {
        id: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
        author: {
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        },
        likes: {
            where: {
                authorId: session?.user?.id || ""
            },
            select: {
                id: true
            }
        },
        comments: {
            select: {
                id: true,
                content: true,
                replyToId: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                reactions: {
                    select: {
                        userId: true,
                        isLike: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        },
        _count: {
            select: {
                likes: true,
                comments: true
            }
        }
    },
    orderBy: {
        createdAt: 'desc'
    }
  }) as any

  type PrismaReaction = {
    userId: string
    isLike: boolean
  }

  type PrismaComment = {
    id: string
    content: string
    createdAt: Date
    replyToId: string | null
    author: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    } | null
    reactions: PrismaReaction[]
  }

  type PrismaPost = {
    id: string
    content: string | null
    mediaUrl: string | null
    mediaType: string | null
    createdAt: Date
    author: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    } | null
    likes: { id: string }[]
    comments: PrismaComment[]
    _count: {
      likes: number
      comments: number
    }
  }

  // Transform data for PostCard
  const transformedPosts = (posts as PrismaPost[]).map((post: PrismaPost) => {
    const author = post.author || { id: "", name: "User", email: "user@example.com", image: null }
    return {
      id: post.id,
      author: {
          id: author.id,
          name: author.name || "User",
          handle: author.email?.split("@")[0] || "user",
          avatar: author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.email}`,
          verified: false
      },
      content: post.content || "",
      image: post.mediaUrl || undefined,
      mediaType: post.mediaType || undefined,
      timestamp: "just now",
      isLiked: (post.likes || []).length > 0,
      currentUserId: session?.user?.id,
      comments: (post.comments || []).map((c: PrismaComment) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          author: {
              id: c.author?.id || "",
              name: c.author?.name || "User",
              image: c.author?.image || null,
              email: c.author?.email || null,
              handle: c.author?.email?.split("@")[0] || "user",
              avatar: c.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.email}`
          },
          replyToId: c.replyToId,
          reactions: (c.reactions || []).map((r: PrismaReaction) => ({
            userId: r.userId,
            isLike: r.isLike
          }))
      })),
      stats: { 
          likes: post._count?.likes || 0, 
          comments: post._count?.comments || 0, 
          reposts: 0, 
          views: 0 
      }
    }
  })

  return (
    <div className="pb-20 md:pb-0">
       {transformedPosts.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
               No posts yet. Be the first to post!
           </div>
       ) : (
           transformedPosts.map((post: typeof transformedPosts[number]) => (
             <PostCard key={post.id} {...post} />
           ))
       )}
    </div>
  )
}
