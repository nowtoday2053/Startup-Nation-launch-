import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper functions for chat and notifications
export const chatKeys = {
  room: (roomId: string) => `chat:room:${roomId}`,
  messages: (roomId: string) => `chat:messages:${roomId}`,
  typing: (roomId: string) => `chat:typing:${roomId}`,
  online: (roomId: string) => `chat:online:${roomId}`,
}

export const notificationKeys = {
  user: (userId: string) => `notifications:${userId}`,
  unread: (userId: string) => `notifications:unread:${userId}`,
} 