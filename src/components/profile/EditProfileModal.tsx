"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { updateProfile } from "@/actions/user"
import { useRouter } from "next/navigation"

interface EditProfileModalProps {
  user: {
    id: string
    name?: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
    pronouns?: string | null
    dob?: Date | null
    showJoinedDate?: boolean
  }
  onClose: () => void
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        onClose()
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">Edit profile</h2>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-foreground text-background px-4 py-1.5 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Name</label>
              <input 
                name="name"
                defaultValue={user.name || ""}
                placeholder="Name"
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Pronouns */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Pronouns</label>
              <input 
                name="pronouns"
                defaultValue={user.pronouns || ""}
                placeholder="Pronouns"
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Bio</label>
              <textarea 
                name="bio"
                defaultValue={user.bio || ""}
                placeholder="Bio"
                rows={3}
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Location</label>
              <input 
                name="location"
                defaultValue={user.location || ""}
                placeholder="Location"
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Website</label>
              <input 
                name="website"
                defaultValue={user.website || ""}
                placeholder="Website"
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 px-1">Date of birth</label>
              <input 
                name="dob"
                type="date"
                defaultValue={user.dob ? new Date(user.dob).toISOString().split('T')[0] : ""}
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Show Joined Date */}
            <div className="flex items-center justify-between p-1">
              <span className="text-sm font-medium">Show joined date</span>
              <input 
                type="checkbox"
                name="showJoinedDate"
                value="true"
                defaultChecked={user.showJoinedDate ?? true}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
