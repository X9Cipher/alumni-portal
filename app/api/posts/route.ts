import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { PostService } from '@/lib/services/postService'
import { NotificationService } from '@/lib/services/notificationService'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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
      
      // Send notification if like was added (not removed)
      if (result.liked) {
        try {
          console.log('Attempting to send like notification for post:', postId)
          console.log('Like result:', result)
          
          // Get post information directly from database
          try {
            const db = await getDatabase()
            const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) })
            console.log('Found post from database for like:', post)
            
            if (post && post.authorId && post.authorId.toString() !== decoded.userId) {
              console.log('Sending like notification to author:', post.authorId, 'authorType:', post.authorType)
              await NotificationService.notifyPostLike(
                {
                  _id: postId,
                  authorId: post.authorId,
                  authorType: post.authorType,
                  content: post.content
                },
                {
                  _id: decoded.userId,
                  firstName: decoded.firstName || 'User',
                  lastName: decoded.lastName || 'User',
                  userType: decoded.userType
                }
              )
              console.log('Like notification sent successfully')
            } else {
              console.log('Skipping like notification - post data missing or same user:', {
                hasPost: !!post,
                authorId: post?.authorId,
                currentUserId: decoded.userId,
                authorType: post?.authorType
              })
            }
          } catch (dbError) {
            console.error('Failed to get post from database for like:', dbError)
          }
        } catch (notificationError) {
          console.error('Failed to send like notification:', notificationError)
          // Don't fail the like action if notifications fail
        }
      }
      
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
      
      // Send notification for new comment
      try {
        console.log('Attempting to send comment notification for post:', postId)
        console.log('Comment result:', result)
        
        // Get post information directly from database
        try {
          const db = await getDatabase()
          const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) })
          console.log('Found post from database:', post)
          
          if (post && post.authorId && post.authorId.toString() !== decoded.userId) {
            console.log('Sending notification to author:', post.authorId, 'authorType:', post.authorType)
            await NotificationService.notifyPostComment(
              {
                _id: postId,
                authorId: post.authorId,
                authorType: post.authorType,
                content: post.content
              },
              {
                content: body.content,
                author: {
                  _id: decoded.userId,
                  firstName: decoded.firstName || 'User',
                  lastName: decoded.lastName || 'User',
                  userType: decoded.userType
                }
              }
            )
            console.log('Comment notification sent successfully')
          } else {
            console.log('Skipping notification - post data missing or same user:', {
              hasPost: !!post,
              authorId: post?.authorId,
              currentUserId: decoded.userId,
              authorType: post?.authorType
            })
          }
        } catch (dbError) {
          console.error('Failed to get post from database:', dbError)
        }
      } catch (notificationError) {
        console.error('Failed to send comment notification:', notificationError)
        // Don't fail the comment action if notifications fail
      }
      
      return NextResponse.json({ success: true, ...result })
    }

    if (action === 'reply') {
      const body = await request.json()
      if (!body?.content || !body?.commentId) return NextResponse.json({ error: 'content and commentId required' }, { status: 400 })
      const result = await PostService.addCommentReply(postId, body.commentId, {
        userId: decoded.userId,
        userType: decoded.userType,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      }, body.content)

      // Send notification to original comment author (not to self)
      try {
        const db = await getDatabase()
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) })
        if (post && result.commentAuthorId && result.commentAuthorId !== decoded.userId) {
          await NotificationService.notifyCommentReply(
            {
              _id: postId,
              authorType: post.authorType,
              content: post.content
            } as any,
            {
              recipientId: result.commentAuthorId,
              recipientType: result.commentAuthorType || 'alumni',
              replier: {
                _id: decoded.userId,
                firstName: decoded.firstName || 'User',
                lastName: decoded.lastName || 'User',
                userType: decoded.userType
              },
              commentId: body.commentId,
              content: body.content
            }
          )
        }
      } catch (e) {
        console.error('Failed to send reply notification:', e)
      }

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
