"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useRef } from "react"

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

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId
        const avatar = message.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.email}`
        const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isSent ? "flex-row-reverse" : "flex-row"}`}
          >
            {!isSent && (
              <Image
                src={avatar}
                alt={message.sender.name || "User"}
                width={32}
                height={32}
                className="rounded-full bg-gray-200 flex-shrink-0"
              />
            )}
            <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[70%]`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  isSent
                    ? "bg-gray-200 text-black rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-sm"
                }`}
              >
                <p className="text-[15px] whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 px-2">
                {timeAgo.replace("about ", "")}
              </span>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
