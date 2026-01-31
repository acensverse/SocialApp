"use client"

import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommentModal } from "./CommentModal"

interface PostGridItemProps {
  post: any
  aspectRatio?: "square" | "video"
}

export function PostGridItem({ post, aspectRatio = "square" }: PostGridItemProps) {
  const [showCommentModal, setShowCommentModal] = useState(false)

  return (
    <>
      <div 
        onClick={() => setShowCommentModal(true)}
        className={cn(
          "relative bg-gray-100 dark:bg-zinc-900 group overflow-hidden cursor-pointer",
          aspectRatio === "video" ? "aspect-[9/16]" : "aspect-square"
        )}
      >
        {post.mediaType === "video" ? (
          <video src={post.image} className="w-full h-full object-cover" />
        ) : (
          <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
           <div className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" /> {post.stats.likes}</div>
           <div className="flex items-center gap-1"><MessageCircle className="w-5 h-5 fill-white" /> {post.stats.comments}</div>
        </div>
      </div>

      {showCommentModal && (
        <CommentModal
          postId={post.id}
          postContent={post.content}
          postImage={post.image}
          postMediaType={post.mediaType}
          postAuthor={post.author}
          comments={post.comments}
          currentUserId={post.currentUserId}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </>
  )
}
