"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function followUser(userIdToFollow: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const currentUserId = session.user.id

  if (currentUserId === userIdToFollow) {
    throw new Error("You cannot follow yourself")
  }

  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: userIdToFollow
    }
  })

  revalidatePath(`/profile/${userIdToFollow}`)
  revalidatePath(`/profile/${currentUserId}`)
  return { success: true }
}

export async function unfollowUser(userIdToUnfollow: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const currentUserId = session.user.id

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userIdToUnfollow
      }
    }
  })

  revalidatePath(`/profile/${userIdToUnfollow}`)
  revalidatePath(`/profile/${currentUserId}`)
  return { success: true }
}

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return []

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    },
    take: 10
  })

  return users
}

export async function getFollowers(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return follows.map(f => f.follower)
}

export async function getFollowing(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return follows.map(f => f.following)
}

import { uploadToCloudinary } from "@/lib/cloudinary"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  const website = formData.get("website") as string
  const pronouns = formData.get("pronouns") as string
  const dobString = formData.get("dob") as string
  const showJoinedDate = formData.get("showJoinedDate") === "true"

  const imageFile = formData.get("imageFile") as File
  const bannerFile = formData.get("bannerFile") as File

  let image = formData.get("image") as string
  let bannerUrl = formData.get("bannerUrl") as string

  // Handle Avatar Upload
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    const result = await uploadToCloudinary(fileBase64, 'avatars', 'image')
    image = result.secure_url
  }

  // Handle Banner Upload
  if (bannerFile && bannerFile.size > 0) {
    const bytes = await bannerFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileBase64 = `data:${bannerFile.type};base64,${buffer.toString('base64')}`
    const result = await uploadToCloudinary(fileBase64, 'banners', 'image')
    bannerUrl = result.secure_url
  }

  const dob = dobString ? new Date(dobString) : null

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio,
      location,
      website,
      pronouns,
      dob,
      image,
      bannerUrl,
      showJoinedDate,
    },
  })

  revalidatePath("/profile")
  revalidatePath(`/profile/${session.user.id}`)
  return { success: true }
}
