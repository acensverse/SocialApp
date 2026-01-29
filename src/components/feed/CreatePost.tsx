"use client"

import { useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { MediaUploader } from "../upload/MediaUploader" // Assuming relative path
import { uploadMedia } from "@/actions/upload"
import { createPost } from "@/actions/post"
import { Image as ImageIcon, Send } from "lucide-react"

export function CreatePost() {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  if (!session) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !selectedFile) return
    setLoading(true)

    try {
      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("content", content)
        const result = await uploadMedia(formData, "post")
        if (!result.success) throw new Error(result.error)
      } else {
        const formData = new FormData()
        formData.append("content", content)
        await createPost(formData)
      }

      setContent("")
      setSelectedFile(null)
      setShowUpload(false)
    } catch (error) {
      console.error(error)
      alert("Failed to post")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="bg-white dark:bg-black p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      <div className="flex gap-4">
        <Image 
          src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
          alt="Avatar" 
          width={40}
          height={40}
          className="rounded-full" 
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-lg placeholder-gray-500"
              rows={2}
            />

            {/* We need to pass state setters to MediaUploader or lift state up */}
            {/* For simplicity, I will inline a simple uploader or modify MediaUploader to accept props */}
            {/* Let's modify MediaUploader next */}
             {showUpload && (
                 <div className="mb-4">
                    <MediaUploader 
                        onFileSelect={(file) => {
                            setSelectedFile(file)
                        }}
                     />
                 </div>
             )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
               <div className="flex gap-2 text-primary">
                  <button type="button" onClick={() => setShowUpload(!showUpload)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                     <ImageIcon className="w-5 h-5" />
                  </button>
               </div>
                <button 
                 type="submit" 
                 disabled={(!content.trim() && !selectedFile) || loading}
                 className="bg-primary text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
               >
                 <Send className="w-4 h-4" />
                 {loading ? "Posting..." : "Post"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
