import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

interface ApplyPayload {
  jobId: string
  jobTitle?: string
  posterEmail: string
  applicantName: string
  applicantEmail?: string
  applicantCourse?: string
  description: string
  attachment?: {
    name: string
    mimeType: string
    contentBase64: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = (await request.json()) as ApplyPayload
    const {
      jobId,
      jobTitle,
      posterEmail,
      applicantName,
      applicantEmail,
      applicantCourse,
      description,
      attachment,
    } = body

    if (!posterEmail || !applicantName || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const subject = `New Job Application${jobTitle ? `: ${jobTitle}` : ''}`
    const htmlContent = `
      <div>
        <h2>New Job Application</h2>
        ${jobTitle ? `<p><strong>Job:</strong> ${jobTitle}</p>` : ''}
        ${jobId ? `<p><strong>Job ID:</strong> ${jobId}</p>` : ''}
        <p><strong>Applicant:</strong> ${applicantName}${applicantEmail ? ` &lt;${applicantEmail}&gt;` : ''}</p>
        ${applicantCourse ? `<p><strong>Course/Department:</strong> ${applicantCourse}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${description.replace(/\n/g, '<br/>')}</p>
      </div>
    `

    const payload: any = {
      to: [{ email: posterEmail }],
      subject,
      htmlContent,
    }

    if (attachment?.contentBase64 && attachment.name) {
      payload.attachment = [{
        name: attachment.name,
        content: attachment.contentBase64,
      }]
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send email', details: err }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Job apply email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


