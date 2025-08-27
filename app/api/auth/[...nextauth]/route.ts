import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { cookies } from "next/headers"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/alumni_portal"
const clientPromise = MongoClient.connect(MONGODB_URI)

async function findUserByEmail(db: any, email: string) {
  const [student, alumni, legacy] = await Promise.all([
    db.collection("students").findOne({ email }),
    db.collection("alumni").findOne({ email }),
    db.collection("users").findOne({ email }) // legacy collection
  ])
  return student || alumni || legacy || null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false
      try {
        const client = await clientPromise
        const db = client.db("alumni_portal")

        // Get the intended userType from the OAuth flow
        const cookieStore = await cookies()
        const intendedType = cookieStore.get("oauth-userType")?.value
        
        if (intendedType !== "student" && intendedType !== "alumni") {
          return "/auth/login?error=invalid_user_type"
        }

        const existing = await findUserByEmail(db, user.email)

        if (existing) {
          // Check if the existing user's userType matches the intended userType
          if (existing.userType !== intendedType) {
            return "/auth/login?error=user_type_mismatch"
          }
          
          // Gate by approval
          if (!existing.isApproved) {
            return "/auth/login?error=pending_approval"
          }
          return true
        }

        // New OAuth user – create minimal pending user in respective collection
        const base: any = {
          email: user.email,
          password: "", // OAuth users don't have local password
          firstName: (user.name || "").split(" ")[0] || "",
          lastName: (user.name || "").split(" ").slice(1).join(" ") || "",
          userType: intendedType,
          isApproved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          department: "",
        }

        if (intendedType === "student") {
          await db.collection("students").insertOne({
            ...base,
            studentId: "",
            currentYear: ""
          })
        } else {
          await db.collection("alumni").insertOne({
            ...base,
            graduationYear: "",
            currentCompany: "",
            currentPosition: ""
          })
        }

        // Block login until approved
        return "/auth/login?error=pending_approval"
      } catch (e) {
        console.error("OAuth signIn error:", e)
        return false
      }
    },
    async jwt({ token }) {
      return token
    },
    async session({ session }) {
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

