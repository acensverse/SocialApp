"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  lastMessage: {
    content: string
    createdAt: Date
    senderId: string
  } | null
  updatedAt: Date
  unreadCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm mt-2">Start a new conversation to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const user = conversation.otherUser
        if (!user) return null

        const avatar = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        const displayName = user.name || user.email?.split("@")[0] || "User"
        const timeAgo = conversation.lastMessage 
          ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })
          : ""

        return (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
              selectedId === conversation.id ? "bg-gray-50 dark:bg-gray-900" : ""
            }`}
          >
            <div className="relative">
              <Image
                src={avatar}
                alt={displayName}
                width={56}
                height={56}
                className="rounded-full bg-gray-200"
              />
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs flex items-center justify-center rounded-full border-2 border-background">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium truncate ${
                  conversation.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {displayName}
                </span>
                {timeAgo && (
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {timeAgo.replace("about ", "")}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className={`text-sm truncate ${
                  conversation.unreadCount > 0 ? "text-gray-900 dark:text-white font-semibold" : "text-gray-500"
                }`}>
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
