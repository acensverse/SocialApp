"use client"

import { Send } from "lucide-react"
import { useState, FormEvent } from "react"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || sending || disabled) return

    setSending(true)
    try {
      await onSend(content)
      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-background">
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all max-h-32 disabled:opacity-50"
          style={{
            minHeight: "48px",
            height: "auto"
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "auto"
            target.style.height = Math.min(target.scrollHeight, 128) + "px"
          }}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending || disabled}
          className="p-3 bg-primary text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 px-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  )
}
