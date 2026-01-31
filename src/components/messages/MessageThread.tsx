"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  createdAt: Date
  senderId: string
  sender: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
}

import { Play, Heart, MessageSquare, Reply } from "lucide-react"

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Start a conversation</h3>
        <p className="text-gray-500 max-w-[240px]">Send a message, photo or reel to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
      {/* Date separator mapping would go here, for now a mock one */}
      <div className="flex justify-center my-8">
        <span className="text-[11px] font-semibold text-gray-400">Fri 9:47 PM</span>
      </div>

      {messages.map((message) => {
        const isSent = message.senderId === currentUserId
        
        // Mock media identification (e.g., if content has a specific format or is a URL)
        const isMedia = message.content.includes("reel") || message.content.includes("attachment")

        return (
          <div
            key={message.id}
            className={cn(
                "flex gap-3 group items-end max-w-[85%]",
                isSent ? "self-end flex-row-reverse" : "self-start flex-row"
            )}
          >
            {!isSent && (
              <div className="relative w-8 h-8 shrink-0 mb-1">
                <Image
                  src={message.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.email}`}
                  alt={message.sender.name || "User"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            
            <div className={cn("flex flex-col", isSent ? "items-end" : "items-start")}>
              {isMedia ? (
                <div className="relative w-64 aspect-[9/16] rounded-[24px] overflow-hidden bg-black shadow-lg border border-gray-100 dark:border-zinc-800">
                    <Image 
                        src="https://images.unsplash.com/photo-1544191173-834f5d9d4513?w=400&h=700&fit=crop" 
                        alt="Reel" 
                        fill 
                        className="object-cover opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Play className="w-3 h-3 text-white fill-current" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">stics.ai</span>
                    </div>
                    <div className="absolute bottom-4 left-4 p-2">
                        <Play className="w-6 h-6 text-white stroke-[2.5px]" />
                    </div>
                </div>
              ) : (
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-[22px] text-[15px] shadow-sm",
                        isSent
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-100 dark:bg-zinc-800 text-foreground"
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              )}
              
              <div className={cn(
                  "flex items-center gap-2 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  isSent ? "flex-row-reverse" : "flex-row"
              )}>
                 <button className="text-gray-400 hover:text-foreground">
                    <Heart className="w-4 h-4" />
                 </button>
                 <button className="text-gray-400 hover:text-foreground">
                    <Reply className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
