import { X, Send, Loader2, SortDesc, Heart, MessageSquare, ThumbsDown, MoreVertical, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { addComment, toggleCommentLike, editComment, deleteComment } from "@/actions/post"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  reactions?: {
    userId: string
    isLike: boolean
  }[]
}

interface ReelsCommentSidebarProps {
  postId: string
  postContent: string
  postAuthor: {
    id: string
    name: string
    handle: string
    avatar: string
    verified?: boolean
  }
  comments: Comment[]
  currentUserId?: string
  onClose: () => void
}

export function ReelsCommentSidebar({ 
    postId, 
    postContent,
    postAuthor,
    comments, 
    currentUserId, 
    onClose 
}: ReelsCommentSidebarProps) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null)
  const [showMenuId, setShowMenuId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addComment(postId, commentText, replyTo?.id)
      setCommentText("")
      setReplyTo(null)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleLike = async (commentId: string, isLike: boolean) => {
    try {
      await toggleCommentLike(commentId, isLike)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return
    try {
      await deleteComment(id)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditComment = async (id: string) => {
    if (!editValue.trim()) return
    try {
      await editComment(id, editValue)
      setEditingCommentId(null)
      setEditValue("")
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const formatTimeAgo = (date: Date) => {
     const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 flex flex-col transition-all duration-300 relative",
      // Desktop Sidebar
      "md:absolute md:top-0 md:right-0 md:w-full md:h-full md:border-l md:border-gray-100 md:dark:border-zinc-800 md:animate-in md:slide-in-from-right",
      // Mobile Bottom Sheet
      "shadow-2xl fixed bottom-0 left-0 right-0 h-[65vh] rounded-t-[32px] md:rounded-none z-[100] animate-in slide-in-from-bottom duration-500"
    )}>
      {/* MINIMAL CLOSE BUTTON */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* MOBILE DRAG HANDLE */}
      <div className="md:hidden flex justify-center p-3">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:pt-10 space-y-8">
        {/* POST CAPTION AS FIRST ITEM */}
        <div className="flex gap-3 pb-6 border-b border-gray-50 dark:border-zinc-900/50">
          <Image
            src={postAuthor.avatar}
            alt={postAuthor.name}
            width={34}
            height={34}
            className="rounded-full bg-gray-100 flex-shrink-0 object-cover mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-gray-900 dark:text-white leading-relaxed">
              <span className="font-bold mr-2">@{postAuthor.handle}</span>
              {postContent ? (
                <span className="text-gray-700 dark:text-gray-300">{postContent}</span>
              ) : (
                <span className="text-gray-400 italic font-normal">Original music • {postAuthor.name}</span>
              )}
            </p>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const hasLiked = comment.reactions?.some(r => r.userId === currentUserId && r.isLike)
            const hasDisliked = comment.reactions?.some(r => r.userId === currentUserId && !r.isLike)
            const likeCount = comment.reactions?.filter(r => r.isLike).length || 0
            const authorName = comment.author.name || comment.author.email?.split("@")[0] || "User"
            const isAuthor = currentUserId === comment.author.id

            return (
              <div key={comment.id} className="flex gap-3 relative group">
                <Image
                  src={comment.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`}
                  alt="Avatar"
                  width={34}
                  height={34}
                  className="rounded-full bg-gray-100 flex-shrink-0 object-cover mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                          @{authorName}
                        </span>
                        <span className="text-[11px] text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    
                    {isAuthor && (
                      <div className="relative">
                        <button 
                          onClick={() => setShowMenuId(showMenuId === comment.id ? null : comment.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-all text-gray-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenuId === comment.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditValue(comment.content)
                                setShowMenuId(null)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                handleDeleteComment(comment.id)
                                setShowMenuId(null)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white outline-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 text-xs font-bold text-gray-500"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 text-xs font-bold text-primary"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[14px] mt-1 text-gray-700 dark:text-gray-300 leading-normal">{comment.content}</p>
                  )}

                  <div className="flex items-center gap-6 mt-3">
                    <button 
                      onClick={() => handleToggleLike(comment.id, true)}
                      className={cn(
                        "flex items-center gap-1.5 transition-colors group",
                        hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", hasLiked && "fill-current")} />
                      <span className="text-[11px] font-bold">{likeCount}</span>
                    </button>
                    <button 
                      onClick={() => handleToggleLike(comment.id, false)}
                      className={cn(
                        "flex items-center gap-1.5 transition-colors group",
                        hasDisliked ? "text-zinc-900 dark:text-white" : "text-gray-500 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <ThumbsDown className={cn("w-4 h-4", hasDisliked && "fill-current")} />
                    </button>
                    <button 
                      onClick={() => {
                        setReplyTo({ id: comment.id, name: authorName })
                        setCommentText(`@${authorName} `)
                      }}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors group"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[11px] font-bold">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <span className="text-xs text-gray-500">
              Replying to <span className="font-bold text-primary">@{replyTo.name}</span>
            </span>
            <button 
              onClick={() => {
                setReplyTo(null)
                // If it only contains the mention, clear it
                if (commentText.trim() === `@${replyTo.name}`) {
                    setCommentText("")
                }
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <form onSubmit={handleAddComment} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={replyTo ? `Reply to @${replyTo.name}...` : "Add a comment..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-gray-200 dark:focus:border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="text-primary font-bold text-sm disabled:opacity-30 px-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "POST"}
          </button>
        </form>
      </div>
    </div>
  )
}
