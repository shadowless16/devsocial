import { NextResponse } from 'next/server'

export async function GET() {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT

  return NextResponse.json({
    vapidPublicConfigured: !!vapidPublic,
    vapidPrivateConfigured: !!vapidPrivate,
    vapidSubjectConfigured: !!vapidSubject,
    vapidPublicLength: vapidPublic?.length || 0,
    vapidPublicPreview: vapidPublic?.substring(0, 20) + '...',
    environment: process.env.NODE_ENV
  })
}
