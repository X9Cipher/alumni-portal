import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { CreatePostRequest, Post } from '@/lib/models/Post'

export class PostService {
  private static collection = 'posts'

  static async createPost(authorId: string, authorType: 'alumni' | 'admin', authorFirstName: string, authorLastName: string, req: CreatePostRequest): Promise<Post> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)

    const post: Post = {
      authorId: new ObjectId(authorId),
      authorType,
      authorFirstName,
      authorLastName,
      type: req.type,
      content: req.content,
      mediaDataUrl: req.mediaDataUrl,
      mediaMimeType: req.mediaMimeType,
      media: req.media,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(post)
    post._id = result.insertedId
    return post
  }

  static async listFeed(limit: number = 50): Promise<Post[]> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const posts = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray()
    return posts
  }

  static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const _id = new ObjectId(postId)
    const u = new ObjectId(userId)
    const post = await collection.findOne({ _id })
    const has = (post?.likes || []).some(id => id.toString() === u.toString())
    if (has) {
      await collection.updateOne({ _id }, { $pull: { likes: u }, $set: { updatedAt: new Date() } })
    } else {
      await collection.updateOne({ _id }, { $addToSet: { likes: u }, $set: { updatedAt: new Date() } })
    }
    const updated = await collection.findOne({ _id })
    const count = (updated?.likes || []).length
    return { liked: !has, likesCount: count }
  }

  static async addComment(postId: string, user: { userId: string; userType: 'student' | 'alumni' | 'admin'; firstName: string; lastName: string }, content: string) {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const _id = new ObjectId(postId)
    const comment = {
      _id: new ObjectId(),
      userId: new ObjectId(user.userId),
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      content,
      createdAt: new Date()
    }
    await collection.updateOne({ _id }, { $push: { comments: comment }, $set: { updatedAt: new Date() } })
    const updated = await collection.findOne({ _id })
    return { comments: updated?.comments || [] }
  }

  static async addCommentReply(
    postId: string,
    commentId: string,
    user: { userId: string; userType: 'student' | 'alumni' | 'admin'; firstName: string; lastName: string },
    content: string
  ): Promise<{ reply: any; commentAuthorId?: string; commentAuthorType?: 'student' | 'alumni' | 'admin' }> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const _id = new ObjectId(postId)
    const cId = new ObjectId(commentId)

    // Load the post to fetch the comment author for notifications
    const post = await collection.findOne({ _id })
    // @ts-ignore - comments shape is flexible
    const targetComment = (post as any)?.comments?.find((c: any) => c._id?.toString() === cId.toString())

    const reply = {
      _id: new ObjectId(),
      userId: new ObjectId(user.userId),
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      content,
      createdAt: new Date()
    }

    await collection.updateOne(
      { _id },
      { $push: { 'comments.$[c].replies': reply }, $set: { updatedAt: new Date() } },
      { arrayFilters: [{ 'c._id': cId }] as any }
    )

    return {
      reply,
      commentAuthorId: targetComment?.userId?.toString?.(),
      commentAuthorType: targetComment?.userType
    }
  }

  static async updatePost(
    postId: string,
    editor: { userId: string; userType: 'alumni' | 'admin' },
    updates: { content?: string; mediaDataUrl?: string | null; mediaMimeType?: string | null; media?: { dataUrl: string; mimeType: string }[] | null; type?: 'text' | 'image' | 'video' | 'article' }
  ): Promise<{ success: boolean }> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const _id = new ObjectId(postId)
    const post = await collection.findOne({ _id })
    if (!post) return { success: false }

    // Permission: admin can edit all, alumni only their own
    const isOwner = post.authorId?.toString() === editor.userId
    if (!(editor.userType === 'admin' || isOwner)) return { success: false }

    const set: any = { updatedAt: new Date() }
    if (typeof updates.content === 'string') set.content = updates.content
    if (updates.media === null || (Array.isArray(updates.media) && updates.media.length === 0)) {
      set.media = []
      set.mediaDataUrl = undefined
      set.mediaMimeType = undefined
      set.type = 'text'
    } else if (Array.isArray(updates.media)) {
      set.media = updates.media
      const first = updates.media[0]
      if (first?.mimeType?.startsWith('image/')) set.type = 'image'
      if (first?.mimeType?.startsWith('video/')) set.type = 'video'
    } else if (updates.mediaDataUrl === null) {
      set.mediaDataUrl = undefined
      set.mediaMimeType = undefined
      set.type = 'text'
    } else if (typeof updates.mediaDataUrl === 'string') {
      set.mediaDataUrl = updates.mediaDataUrl
      set.mediaMimeType = updates.mediaMimeType
      if (updates.mediaMimeType?.startsWith('image/')) set.type = 'image'
      if (updates.mediaMimeType?.startsWith('video/')) set.type = 'video'
    } else if (updates.type) {
      set.type = updates.type
    }

    await collection.updateOne({ _id }, { $set: set })
    return { success: true }
  }

  static async deletePost(postId: string, requester: { userId: string; userType: 'alumni' | 'admin' }): Promise<{ success: boolean }> {
    const db = await getDatabase()
    const collection = db.collection<Post>(this.collection)
    const _id = new ObjectId(postId)
    const post = await collection.findOne({ _id })
    if (!post) return { success: false }
    const isOwner = post.authorId?.toString() === requester.userId
    if (!(requester.userType === 'admin' || isOwner)) return { success: false }
    await collection.deleteOne({ _id })
    return { success: true }
  }
}
