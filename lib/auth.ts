import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
    },
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Credentials authorize called for:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          console.log("User not found:", credentials.email)
          return null
        }

        if (!user.password) {
          console.log("User has no password (OAuth user):", credentials.email)
          throw new Error("This account was created with Google. Please use 'Sign in with Google' instead.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log("Invalid password for:", credentials.email)
          return null
        }

        console.log("User authenticated successfully:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        }
      }
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        // Ensure session.user exists before setting properties
        if (!session.user) {
          session.user = {}
        }
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.username = token.username
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback", { tokenEmail: token.email, userEmail: user?.email, provider: account?.provider })
      
      if (user) {
        // First time sign in, user object is available
        token.id = user.id
        token.username = user.username
        token.role = user.role
        return token
      }

      // Subsequent requests, get user from database
      if (token.email) {
        const dbUser = await db.user.findFirst({
          where: {
            email: token.email,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.role = dbUser.role
        }
      }

      return token
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered", { provider: account?.provider, email: user.email })
      
      // Only handle OAuth providers, not credentials
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user for OAuth
            const username = user.email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
            
            // Handle potential username conflicts
            let finalUsername = username
            let counter = 1
            while (await db.user.findUnique({ where: { username: finalUsername } })) {
              finalUsername = `${username}${counter}`
              counter++
            }
            
            const newUser = await db.user.create({
              data: {
                name: user.name!,
                email: user.email!,
                image: user.image,
                username: finalUsername,
                onboardingCompleted: false, // Ensure new users need onboarding
              }
            })
            console.log(`New user created: ${user.email} via ${account.provider}`, newUser)
          } else {
            console.log(`Existing user signed in: ${user.email} via ${account.provider}`)
            
            // Update user image if it's from OAuth and different
            if (user.image && existingUser.image !== user.image) {
              await db.user.update({
                where: { email: user.email! },
                data: { image: user.image }
              })
            }
          }
        } catch (error) {
          console.error("OAuth sign in error:", error)
          return false
        }
      }
      
      // Always return true for successful sign-ins
      return true
    },
    async redirect({ url, baseUrl, token }) {
      console.log(`Redirect called with url: ${url}, baseUrl: ${baseUrl}`)
      
      // If it's a relative URL, prepend the base URL
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        console.log(`Redirecting to: ${redirectUrl}`)
        return redirectUrl
      }
      
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        console.log(`Same origin redirect: ${url}`)
        return url
      }
      
      // For OAuth redirects, go directly to feed
      const defaultUrl = `${baseUrl}/feed`
      console.log(`Default redirect to: ${defaultUrl}`)
      return defaultUrl
    },
  },
} 