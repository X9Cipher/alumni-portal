import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const resolved = 'then' in (context.params as any) ? await (context.params as Promise<{ id: string }>) : (context.params as { id: string })
    const postId = resolved.id

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    const db = await getDatabase()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


