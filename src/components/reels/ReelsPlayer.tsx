"use client"

import { useState, useEffect, useRef } from "react"
import {
  Heart,
  MessageCircle,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share as ShareIcon,
  Play,
  Repeat,
  Bookmark,
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toggleLike, deletePost, editPost } from "@/actions/post"
import { ShareModal } from "@/components/shared/ShareModal"
import { ReelsCommentSidebar } from "./ReelsCommentSidebar"
import { useRouter } from "next/navigation"

interface Reel {
  id: string
  url: string
  author: {
    id: string
    name: string
    handle: string
    avatar: string
    verified?: boolean
  }
  description: string
  likes: string
  commentsCount: string
  comments: any[]
  isLiked: boolean
}

interface ReelsPlayerProps {
  reels: Reel[]
  currentUserId?: string
}

export function ReelsPlayer({ reels, currentUserId }: ReelsPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showMenuId, setShowMenuId] = useState<string | null>(null)
  const [editingReelId, setEditingReelId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const router = useRouter()

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const [likeStates, setLikeStates] = useState(
    reels.reduce((acc, reel) => {
      acc[reel.id] = { isLiked: reel.isLiked, count: parseInt(reel.likes) }
      return acc
    }, {} as Record<string, { isLiked: boolean; count: number }>)
  )

  const currentReel = reels[currentIndex]

  // Sync mute with active video
  useEffect(() => {
    const video = videoRefs.current[currentIndex]
    if (video) {
      video.muted = isMuted
      if (!isMuted) video.volume = 1
    }
  }, [isMuted, currentIndex])

  // Auto play / pause on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement
          const index = videoRefs.current.indexOf(video)

          if (entry.isIntersecting) {
            setCurrentIndex(index)
            video.play().catch(() => {})
            setIsPaused(false)
          } else {
            video.pause()
          }
        })
      },
      { root: containerRef.current, threshold: 0.5 }
    )

    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => observer.disconnect()
  }, [])

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index]
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPaused(false)
    } else {
      video.pause()
      setIsPaused(true)
    }
  }

  const handleLike = async () => {
    const prev = likeStates[currentReel.id]

    setLikeStates(s => ({
      ...s,
      [currentReel.id]: {
        isLiked: !prev.isLiked,
        count: prev.isLiked ? prev.count - 1 : prev.count + 1
      }
    }))

    try {
      await toggleLike(currentReel.id)
    } catch {
      setLikeStates(s => ({ ...s, [currentReel.id]: prev }))
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return
    try {
      await deletePost(postId)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete reel")
    }
  }

  const handleEditReel = async (id: string) => {
    if (!editValue.trim()) return
    try {
      await editPost(id, editValue)
      setEditingReelId(null)
      setEditValue("")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to edit reel")
    }
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100dvh-4rem)] md:h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black overflow-x-hidden"
      style={{ scrollbarWidth: "none" }}
    >
      {reels.map((reel, index) => {
        const likeState = likeStates[reel.id]
        const isAuthor = currentUserId === reel.author.id
        const isCurrent = index === currentIndex

        return (
          <div
            key={reel.id}
            className="h-[calc(100dvh-4rem)] md:h-screen w-full snap-start flex bg-black relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* SPLIT LAYOUT CONTAINER */}
            <div className="flex flex-row w-full h-full relative">
              
              {/* MAIN REEL AREA (VIDEO + ACTIONS OVERLAY) */}
              <div className="flex-1 h-full relative flex items-center justify-center transition-all duration-300">
                
                {/* VIDEO WRAPPER */}
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* VIDEO CONTAINER - Responsive sizing */}
                  <div 
                    className="relative flex items-center justify-center flex-shrink-0 transition-all duration-300" 
                    style={{ 
                      width: 'min(100vw, calc(100vh * 9/16), 650px)', 
                      height: '100% ' // Takes 100% of parent which is adjusted per device
                    }}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el
                      }}
                      src={reel.url}
                      className="h-full w-full object-contain cursor-pointer md:rounded-xl bg-zinc-900 shadow-2xl"
                      loop
                      muted={isMuted}
                      playsInline
                      onClick={() => togglePlay(index)}
                    />

                    {/* ACTIONS OVERLAY (MOBILE) */}
                    <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 md:hidden z-20">
                      <div className="flex flex-col items-center">
                        <button onClick={handleLike} className="flex flex-col items-center p-2">
                          <Heart
                            className={cn(
                              "w-8 h-8",
                              likeState.isLiked ? "fill-red-500 text-red-500" : "text-white"
                            )}
                          />
                          <span className="text-[10px] mt-1 font-bold text-white shadow-sm">{likeState.count}</span>
                        </button>
                      </div>
                      <div className="flex flex-col items-center">
                        <button onClick={() => setShowCommentModal(true)} className="flex flex-col items-center p-2">
                          <MessageCircle className="w-8 h-8 text-white" />
                          <span className="text-[10px] mt-1 font-bold text-white shadow-sm">{reel.commentsCount}</span>
                        </button>
                      </div>
                      <button onClick={() => setShowShare(true)} className="p-2">
                        <ShareIcon className="w-8 h-8 text-white" />
                      </button>

                      <button className="p-2">
                        <Repeat className="w-8 h-8 text-white" />
                      </button>
                      <button className="p-2">
                        <Bookmark className="w-8 h-8 text-white" />
                      </button>

                      {isAuthor && (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMenuId(showMenuId === reel.id ? null : reel.id)
                            }}
                            className="p-2 text-white"
                          >
                            <MoreVertical className="w-8 h-8" />
                          </button>
                          
                          {showMenuId === reel.id && (
                            <div className="absolute right-0 bottom-full mb-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 min-w-[140px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingReelId(reel.id)
                                  setEditValue(reel.description)
                                  setShowMenuId(null)
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
                              >
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(reel.id)
                                  setShowMenuId(null)
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* PLAY ICON OVERLAY */}
                    {isPaused && isCurrent && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <div className="bg-black/50 p-5 rounded-full z-10">
                          <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                      </div>
                    )}

                    {/* REEL INFO OVERLAY */}
                    <div className="absolute bottom-4 left-4 right-16 md:right-4 text-white z-10">
                      <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                        <Link href={`/profile/${reel.author.id}`}>
                          <img 
                            src={reel.author.avatar} 
                            alt={reel.author.name}
                            className="w-10 h-10 rounded-full border border-white/20 object-cover"
                          />
                        </Link>
                        <Link href={`/profile/${reel.author.id}`} className="font-bold hover:underline">
                          {reel.author.name}
                        </Link>
                        {!isAuthor && (
                          <button className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold ml-2 hover:bg-gray-200 transition-colors">
                            Follow
                          </button>
                        )}
                      </div>

                      {editingReelId === reel.id ? (
                        <div className="pointer-events-auto bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/10 max-w-sm">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-transparent text-sm text-white border-none outline-none resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              onClick={() => setEditingReelId(null)}
                              className="px-3 py-1 text-xs font-bold text-gray-400"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleEditReel(reel.id)}
                              className="px-3 py-1 text-xs font-bold text-white bg-blue-500 rounded-full"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm line-clamp-2 max-w-sm drop-shadow-lg pointer-events-none">
                          {reel.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DESKTOP ACTIONS COLUMN */}
                  <div className={cn(
                    "hidden md:flex flex-col items-center gap-5 text-white z-10 shrink-0 ml-6 pb-12 self-end"
                  )}>
                    <div className="flex flex-col items-center">
                      <button onClick={handleLike} className="group flex flex-col items-center">
                        <div className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all">
                          <Heart
                            className={cn(
                              "w-7 h-7",
                              likeState.isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white group-hover:scale-110"
                            )}
                          />
                        </div>
                        <span className="text-xs mt-1 font-medium">{likeState.count}</span>
                      </button>
                    </div>

                    <div className="flex flex-col items-center">
                      <button onClick={() => setShowCommentModal(true)} className="group flex flex-col items-center">
                        <div className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all">
                          <MessageCircle className="w-7 h-7 group-hover:scale-110" />
                        </div>
                        <span className="text-xs mt-1 font-medium">{reel.commentsCount}</span>
                      </button>
                    </div>

                    <button onClick={() => setShowShare(true)} className="group flex flex-col items-center">
                      <div className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all">
                        <ShareIcon className="w-7 h-7 group-hover:scale-110" />
                      </div>
                    </button>

                    <button className="group flex flex-col items-center">
                      <div className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all">
                        <Repeat className="w-7 h-7 group-hover:scale-110" />
                      </div>
                    </button>

                    <button className="group flex flex-col items-center">
                      <div className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all">
                        <Bookmark className="w-7 h-7 group-hover:scale-110" />
                      </div>
                    </button>

                    {isAuthor && (
                      <div className="relative">
                        <button 
                          onClick={() => setShowMenuId(showMenuId === reel.id ? null : reel.id)}
                          className="p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-full transition-all text-white group flex flex-col items-center"
                        >
                          <MoreVertical className="w-7 h-7 group-hover:scale-110" />
                        </button>
                        
                        {showMenuId === reel.id && (
                          <div className="absolute right-0 bottom-full mb-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={() => {
                                setEditingReelId(reel.id)
                                setEditValue(reel.description)
                                setShowMenuId(null)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                handleDelete(reel.id)
                                setShowMenuId(null)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* SHARED CONTROLS (BACK, MUTE) */}
                <Link
                  href="/"
                  className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 rounded-full z-20 transition-colors"
                >
                  <ArrowLeft className="text-white w-6 h-6" />
                </Link>

                {isCurrent && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setIsMuted(!isMuted)
                    }}
                    className={cn(
                      "absolute top-6 right-6 z-20",
                      "bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60",
                      "transition-all duration-200",
                      isHovered ? "opacity-100" : "opacity-0 invisible md:visible md:opacity-0 md:group-hover:opacity-100"
                    )}
                  >
                    {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                  </button>
                )}
              </div>

              {/* MOBILE BACKDROP */}
              {showCommentModal && isCurrent && (
                <div 
                  className="fixed inset-0 bottom-16 bg-black/60 z-[110] md:hidden animate-in fade-in duration-300"
                  onClick={() => setShowCommentModal(false)}
                />
              )}

              {/* RESPONIVE COMMENT MODAL/SIDEBAR */}
              <div className={cn(
                "transition-all duration-500 ease-in-out z-[120]",
                "fixed bottom-16 left-0 right-0 md:relative md:h-full md:w-auto md:bottom-auto",
                showCommentModal && isCurrent ? "opacity-100 visible translate-y-0" : "opacity-0 invisible pointer-events-none translate-y-10 md:w-0"
              )}>
                {showCommentModal && isCurrent && (
                  <ReelsCommentSidebar 
                    postId={reel.id}
                    postContent={reel.description}
                    postAuthor={reel.author}
                    comments={reel.comments}
                    currentUserId={currentUserId}
                    onClose={() => setShowCommentModal(false)}
                  />
                )}
              </div>
            </div>

          </div>
        )
      })}

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url="/reels"
        title="Check out this reel!"
      />
    </div>
  )
}

