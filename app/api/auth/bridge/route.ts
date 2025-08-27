import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { MongoClient } from 'mongodb'
import { generateToken, verifyToken } from '@/lib/auth'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_portal'

async function findUserByEmail(db: any, email: string) {
  const [student, alumni] = await Promise.all([
    db.collection('students').findOne({ email }),
    db.collection('alumni').findOne({ email })
  ])
  return student || alumni || null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirect = searchParams.get('redirect') || '/'
  const origin = new URL(request.url).origin
  const toAbsolute = (u: string) => (u.startsWith('http://') || u.startsWith('https://')) ? u : `${origin}${u}`

  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.redirect(toAbsolute(redirect))
    }

    const client = await MongoClient.connect(MONGODB_URI)
    const db = client.db('alumni_portal')
    const user = await findUserByEmail(db, session.user.email)
    if (!user || !user.isApproved) {
      return NextResponse.redirect(toAbsolute('/auth/login?error=pending_approval'))
    }

    // Validate that the redirect destination matches the user's type
    if (redirect.startsWith('/student') && user.userType !== 'student') {
      return NextResponse.redirect(toAbsolute('/auth/login?error=user_type_mismatch'))
    }
    if (redirect.startsWith('/alumni') && user.userType !== 'alumni') {
      return NextResponse.redirect(toAbsolute('/auth/login?error=user_type_mismatch'))
    }

    // Issue app JWT so existing REST APIs (connections, directory, etc.) authorize
    const token = generateToken(user)
    const decoded = verifyToken(token)
    const sessionId = decoded?.sessionId
    const cookieName = `auth-token-${sessionId}`

    const response = NextResponse.redirect(toAbsolute(redirect))
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })
    response.cookies.set('current-session', sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })
    await client.close()
    return response
  } catch (e) {
    return NextResponse.redirect(toAbsolute('/auth/login'))
  }
}


