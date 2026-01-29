"use client"

import { useState } from "react"
import { Image as ImageIcon, X, Film, User as UserIcon, PlusCircle, LucideIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { uploadMedia, updateProfileImage } from "@/actions/upload"
import { useSession } from "next-auth/react"

type UploadType = "post" | "story" | "profile"

export default function CreatePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeType, setActiveType] = useState<UploadType>("post")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
    }
  }

  const handlePost = async () => {
    if (!file && activeType !== "post") return
    if (!file && activeType === "post" && !caption.trim()) return
    
    setLoading(true)

    try {
      const formData = new FormData()
      if (file) formData.append("file", file)
      formData.append("content", caption)

      if (activeType === "post") {
        if (file) {
          const result = await uploadMedia(formData, "post")
          if (!result.success) throw new Error(result.error)
        } else {
          const { createPost } = await import("@/actions/post")
          await createPost(formData)
        }
        router.push("/")
      } else if (activeType === "story") {
        if (!file) throw new Error("File required for story")
        const result = await uploadMedia(formData, "story")
        if (!result.success) throw new Error(result.error)
        router.push("/")
      } else if (activeType === "profile") {
        if (!file) throw new Error("File required for profile update")
        const result = await updateProfileImage(formData)
        if (!result.success) throw new Error(result.error)
        router.push("/profile")
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to share")
    } finally {
      setLoading(false)
    }
  }

  const types: { id: UploadType; label: string; icon: LucideIcon }[] = [
    { id: "post", label: "Post", icon: PlusCircle },
    { id: "story", label: "Story", icon: Film },
    { id: "profile", label: "Profile", icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-black md:border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
               <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-center">Create New {activeType.charAt(0).toUpperCase() + activeType.slice(1)}</h1>
            <button 
              onClick={handlePost}
              disabled={(!file && (activeType !== "post" || !caption.trim())) || loading}
              className="text-primary font-bold disabled:opacity-50 hover:text-blue-600 transition-colors px-4 py-1"
            >
              {loading ? "Sharing..." : "Share"}
            </button>
        </div>

        {/* Type Selector */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
            {types.map((t) => (
                <button
                    key={t.id}
                    onClick={() => {
                        setActiveType(t.id)
                        setFile(null)
                        setPreview(null)
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors relative ${activeType === t.id ? "text-primary" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                    {activeType === t.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                </button>
            ))}
        </div>

        <div className="p-6 flex flex-col gap-8 flex-1">
            {/* Image Preview / Drop Area */}
            <div className={`w-full ${activeType === 'story' ? 'aspect-[9/16] max-h-[600px]' : 'aspect-square'} bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden group shadow-inner transition-all duration-300`}>
                {preview ? (
                   <>
                      {file?.type.startsWith('video') ? (
                          <video 
                            src={preview} 
                            controls 
                            className={`w-full h-full object-contain ${activeType === 'story' ? 'aspect-[9/16]' : ''}`}
                          />
                      ) : (
                          <div className={`relative w-full h-full ${activeType === 'story' ? 'aspect-[9/16]' : ''}`}>
                            <Image 
                                src={preview} 
                                alt="Preview" 
                                fill
                                className="object-contain" 
                            />
                          </div>
                      )}
                      <button 
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </>
                ) : (
                   <label className="cursor-pointer flex flex-col items-center gap-4 text-gray-500 hover:text-primary transition-all p-10 text-center w-full h-full justify-center">
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Select {activeType === 'profile' ? 'Photo' : 'Media'}</p>
                        <p className="text-sm opacity-60">{activeType === 'story' ? '9:16 Video or Image' : 'Photos or Videos'} up to 10MB</p>
                      </div>
                      <input type="file" className="hidden" accept={activeType === 'profile' ? "image/*" : "image/*,video/*"} onChange={handleFileChange} />
                   </label>
                )}
            </div>

            {/* Caption Input - Only for Posts */}
            {activeType === "post" && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                      <Image 
                        src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`} 
                        alt="User" 
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                   </div>
                   <textarea 
                     placeholder="Write a caption..." 
                     className="flex-1 bg-transparent resize-none outline-none min-h-[120px] text-lg leading-relaxed placeholder:text-gray-400"
                     value={caption}
                     onChange={(e) => setCaption(e.target.value)}
                   />
                </div>
            )}

            {activeType === "story" && (
                <div className="text-center text-gray-500 text-sm animate-in fade-in duration-300">
                    Stories vanish after 24 hours.
                </div>
            )}

            {activeType === "profile" && (
                <div className="text-center text-gray-500 text-sm animate-in fade-in duration-300">
                    This will update your profile picture across the platform.
                </div>
            )}
        </div>

      </div>
    </div>
  )
}
