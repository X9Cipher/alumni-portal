"use client"

import { useEffect, useMemo, useState } from "react"

interface PostDetailProps {
  postId: string
}

export default function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<any | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentInput, setCommentInput] = useState("")
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [mediaIndex, setMediaIndex] = useState(0)

  const refresh = async () => {
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

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const likeCount = useMemo(() => (post?.likes || []).length, [post])
  const comments = useMemo(() => post?.comments || [], [post])

  const submitComment = async () => {
    const content = commentInput.trim()
    if (!content) return
    const res = await fetch(`/api/posts?action=comment&postId=${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content })
    })
    if (res.ok) {
      setCommentInput("")
      refresh()
    }
  }

  const submitReply = async (commentId: string) => {
    const content = (replyInputs[commentId] || '').trim()
    if (!content) return
    const res = await fetch(`/api/posts?action=reply&postId=${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ commentId, content })
    })
    if (res.ok) {
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }))
      refresh()
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!post) return <div className="p-6">Post not found</div>

  const mediaItems: { dataUrl?: string; mimeType?: string }[] = Array.isArray(post.media) && post.media.length > 0
    ? post.media
    : (post.mediaDataUrl ? [{ dataUrl: post.mediaDataUrl, mimeType: post.mediaMimeType }] : [])

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" data-post-id={post._id}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Media + content */}
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="relative" style={{ minHeight: '20rem' }}>
            {mediaItems.length > 0 ? (
              <>
                <MediaViewer dataUrl={mediaItems[mediaIndex]?.dataUrl} mimeType={mediaItems[mediaIndex]?.mimeType} />
                {mediaItems.length > 1 && (
                  <>
                    <button
                      aria-label="Previous"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => setMediaIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)}
                    >
                      ‹
                    </button>
                    <button
                      aria-label="Next"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => setMediaIndex((i) => (i + 1) % mediaItems.length)}
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {mediaItems.map((_, idx) => (
                        <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === mediaIndex ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-6 text-sm text-gray-600">No media</div>
            )}
          </div>
          <div className="p-4">
            <div className="font-semibold text-gray-900">{post.authorFirstName} {post.authorLastName}</div>
            <div className="mt-2 whitespace-pre-wrap break-words">{post.content}</div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              <span>{comments.length ? `${comments.length} comments` : 'Comment'}</span>
            </div>
          </div>
        </div>

        {/* Right: Comments & replies */}
        <div className="bg-white border rounded-md p-4 h-fit lg:max-h-[80vh] lg:overflow-y-auto">
          <div className="text-sm text-gray-700 font-medium mb-3">Comments</div>
          <div className="space-y-3">
            {(comments as any[]).map((c) => {
              const cid = (c._id && (c._id.$oid || c._id.toString?.() || c._id)) || ''
              const replies: any[] = c.replies || []
              const open = expandedComments.has(cid)
              return (
                <div key={cid} className="rounded-md bg-gray-50 p-3">
                  <div className="font-medium text-sm mb-1">{c.firstName} {c.lastName}</div>
                  <div className="text-sm">{c.content}</div>
                  {replies.length > 0 && (
                    <button className="mt-2 text-xs text-gray-600 hover:text-[#a41a2f]" onClick={() => { const n = new Set(expandedComments); if (open) n.delete(cid); else n.add(cid); setExpandedComments(n) }}>
                      {open ? 'Hide replies' : `View replies (${replies.length})`}
                    </button>
                  )}
                  {open && replies.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {replies.map((r: any) => (
                        <div key={(r._id && (r._id.$oid || r._id)) || Math.random()} className="ml-3 border-l pl-3">
                          <div className="text-xs font-medium">{r.firstName} {r.lastName}</div>
                          <div className="text-sm">{r.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Reply box */}
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      placeholder="Write a reply..."
                      value={replyInputs[cid] || ''}
                      onChange={(e) => setReplyInputs((p) => ({ ...p, [cid]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitReply(cid) }}
                    />
                    <button className="px-3 py-1 rounded bg-[#a41a2f] text-white text-sm" onClick={() => submitReply(cid)} disabled={!((replyInputs[cid] || '').trim())}>Reply</button>
                  </div>
                </div>
              )
            })}

            {/* Add new comment */}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-2 text-sm"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
              />
              <button className="px-3 py-2 rounded bg-[#a41a2f] text-white text-sm" onClick={submitComment} disabled={!commentInput.trim()}>Comment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MediaViewer({ dataUrl, mimeType }: { dataUrl?: string; mimeType?: string }) {
  if (!dataUrl) return null
  if (mimeType?.startsWith('image/')) {
    return (
      <div className="w-full h-[20rem] md:h-[22rem] lg:h-[24rem] bg-black/5 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="post media" className="max-h-full max-w-full object-contain" />
      </div>
    )
  }
  if (mimeType?.startsWith('video/')) {
    return (
      <div className="w-full h-[20rem] md:h-[22rem] lg:h-[24rem] bg-black/5 flex items-center justify-center">
        <video controls className="max-h-full max-w-full rounded">
          <source src={dataUrl} type={mimeType} />
        </video>
      </div>
    )
  }
  return (
    <div className="w-full h-[20rem] md:h-[22rem] lg:h-[24rem] bg-black/5 flex items-center justify-center">
      <a href={dataUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View attachment</a>
    </div>
  )
}


