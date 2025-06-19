import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username?: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
    role: Role
  }
} 