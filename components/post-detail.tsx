"use client"

import { useEffect, useMemo, useState } from "react"

interface PostDetailProps {
  postId: string
}

export default function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<any | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load post')
        setPost(data.post)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const likeCount = useMemo(() => (post?.likes || []).length, [post])
  const comments = useMemo(() => post?.comments || [], [post])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!post) return <div className="p-6">Post not found</div>

  const mediaItems: { dataUrl?: string; mimeType?: string }[] = Array.isArray(post.media) && post.media.length > 0
    ? post.media
    : (post.mediaDataUrl ? [{ dataUrl: post.mediaDataUrl, mimeType: post.mediaMimeType }] : [])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto" data-post-id={post._id}>
      <div className="border rounded-lg bg-white">
        <div className="p-4 sm:p-5 border-b">
          <div className="text-sm text-gray-500">By {post.authorFirstName} {post.authorLastName}</div>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="whitespace-pre-wrap text-gray-900">{post.content}</div>

          {mediaItems.length > 0 && (
            <div className="grid gap-3">
              {mediaItems.map((m, idx) => (
                <MediaViewer key={idx} dataUrl={m.dataUrl} mimeType={m.mimeType} />
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</div>

          {comments.length > 0 && (
            <div>
              <div className="font-medium mb-2">Comments</div>
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={(c._id && (c._id.$oid || c._id)) || Math.random()} className="bg-gray-50 border rounded p-3">
                    <div className="text-sm text-gray-700 mb-1">{c.firstName} {c.lastName}</div>
                    <div className="whitespace-pre-wrap text-sm">{c.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MediaViewer({ dataUrl, mimeType }: { dataUrl?: string; mimeType?: string }) {
  if (!dataUrl) return null
  if (mimeType?.startsWith('image/')) {
    return (
      <img src={dataUrl} alt="post media" className="max-h-[480px] w-full object-contain rounded" />
    )
  }
  if (mimeType?.startsWith('video/')) {
    return (
      <video controls className="w-full rounded">
        <source src={dataUrl} type={mimeType} />
      </video>
    )
  }
  return (
    <a href={dataUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View attachment</a>
  )
}


