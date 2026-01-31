"use client"

import { useState, FormEvent, useRef } from "react"
import { Smile, Mic, Image as ImageIcon, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || sending || disabled) return

    setSending(true)
    try {
      await onSend(content)
      setContent("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
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
    <div className="p-4 bg-background">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[30px] px-4 py-2 min-h-[44px]">
        <button type="button" className="p-2 hover:opacity-70 transition-opacity">
            <Smile className="w-6 h-6 text-foreground" />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 bg-transparent resize-none text-[15px] py-1.5 focus:outline-none max-h-32 disabled:opacity-50"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "auto"
            target.style.height = Math.min(target.scrollHeight, 128) + "px"
          }}
        />

        <div className="flex items-center gap-1">
          {content.trim() ? (
            <button
              type="submit"
              disabled={sending || disabled}
              className="px-4 py-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Send
            </button>
          ) : (
            <>
                <button type="button" className="p-2 hover:opacity-70 transition-opacity">
                    <Mic className="w-6 h-6 text-foreground" />
                </button>
                <button type="button" className="p-2 hover:opacity-70 transition-opacity">
                    <ImageIcon className="w-6 h-6 text-foreground" />
                </button>
                <button type="button" className="p-2 hover:opacity-70 transition-opacity">
                    <Heart className="w-6 h-6 text-foreground" />
                </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
