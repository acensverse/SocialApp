"use client"

import { SquarePen } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { ConversationList } from "@/components/messages/ConversationList"
import { MessageThread } from "@/components/messages/MessageThread"
import { MessageInput } from "@/components/messages/MessageInput"
import { NewMessageModal } from "@/components/messages/NewMessageModal"
import { getConversations, getMessages, sendMessage, getOrCreateConversation } from "@/actions/message"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

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

function MessagesContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/login")
      return
    }
    loadConversations()
  }, [session, router])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId])

  // Handle userId query parameter
  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId && session?.user?.id && conversations.length > 0) {
      handleSelectUser(userId)
    }
  }, [searchParams, session, conversations])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data as Conversation[])
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const data = await getMessages(conversationId)
      setMessages(data as Message[])
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return

    try {
      const newMessage = await sendMessage(selectedConversationId, content)
      setMessages(prev => [...prev, newMessage as Message])
      await loadConversations() // Refresh conversation list to update last message
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    }
  }

  const handleSelectUser = async (userId: string) => {
    try {
      const conversationId = await getOrCreateConversation(userId)
      setSelectedConversationId(conversationId)
      await loadConversations()
    } catch (error) {
      console.error("Failed to create conversation:", error)
      alert("Failed to start conversation. Please try again.")
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="flex h-screen">
        {/* Conversation List - Hidden on mobile when conversation selected */}
        <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col ${
          selectedConversationId ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-background z-10 flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <SquarePen className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>Loading conversations...</p>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId || undefined}
                onSelect={setSelectedConversationId}
              />
            )}
          </div>
        </div>

        {/* Message Thread - Hidden on mobile when no conversation selected */}
        <div className={`flex-1 flex flex-col ${
          selectedConversationId ? "flex" : "hidden md:flex"
        }`}>
          {selectedConversationId && selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-background sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full -ml-2"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="font-bold">
                      {selectedConversation.otherUser?.name || 
                       selectedConversation.otherUser?.email?.split("@")[0] || 
                       "User"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      @{selectedConversation.otherUser?.email?.split("@")[0] || "user"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Loading messages...</p>
                </div>
              ) : (
                <MessageThread messages={messages} currentUserId={session.user.id} />
              )}

              {/* Input */}
              <MessageInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-2">Choose a conversation from the list or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSelectUser={handleSelectUser}
        />
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
