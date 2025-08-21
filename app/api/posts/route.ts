import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { PostService } from '@/lib/services/postService'

export async function GET() {
  try {
    const posts = await PostService.listFeed(100)
    return NextResponse.json({ success: true, posts })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || (decoded.userType !== 'alumni' && decoded.userType !== 'admin')) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }
    const body = await request.json()
    if (!body?.type || !body?.content) {
      return NextResponse.json({ error: 'type and content are required' }, { status: 400 })
    }
    const post = await PostService.createPost(
      decoded.userId,
      decoded.userType,
      decoded.firstName,
      decoded.lastName,
      {
        type: body.type,
        content: body.content,
        mediaDataUrl: body.mediaDataUrl,
        mediaMimeType: body.mediaMimeType,
        media: body.media,
      }
    )
    return NextResponse.json({ success: true, post })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // like | comment | edit | delete
    const postId = searchParams.get('postId')
    if (!postId || !action) return NextResponse.json({ error: 'postId and action required' }, { status: 400 })

    if (action === 'like') {
      const result = await PostService.toggleLike(postId, decoded.userId)
      return NextResponse.json({ success: true, ...result })
    }
    if (action === 'comment') {
      const body = await request.json()
      if (!body?.content) return NextResponse.json({ error: 'content required' }, { status: 400 })
      const result = await PostService.addComment(postId, {
        userId: decoded.userId,
        userType: decoded.userType,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      }, body.content)
      return NextResponse.json({ success: true, ...result })
    }

    if (action === 'edit') {
      const body = await request.json()
      const ok = await PostService.updatePost(postId, { userId: decoded.userId, userType: decoded.userType as any }, body)
      if (!ok.success) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const ok = await PostService.deletePost(postId, { userId: decoded.userId, userType: decoded.userType as any })
      if (!ok.success) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
