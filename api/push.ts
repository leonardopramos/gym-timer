import type { VercelRequest, VercelResponse } from '@vercel/node'
import webpush from 'web-push'

const MAX_DELAY = 300 // seconds

function parseBody(req: VercelRequest) {
  try {
    if (typeof req.body === 'string') return JSON.parse(req.body)
    return req.body
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const body = parseBody(req)
  if (!body?.subscription) return res.status(400).json({ error: 'Missing subscription' })

  const delaySeconds = Math.min(Math.max(Number(body.delaySeconds) || 0, 5), MAX_DELAY)
  const title = body.title || 'Descanso acabou'
  const text = body.body || 'Volte para a próxima série.'

  const vapidPublic = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'VAPID keys missing on server' })
  }

  webpush.setVapidDetails('mailto:you@example.com', vapidPublic, vapidPrivate)

  await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000))

  try {
    await webpush.sendNotification(body.subscription, JSON.stringify({ title, body: text }))
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('push failed', error)
    return res.status(500).json({ error: 'Push failed' })
  }
}

export const config = {
  maxDuration: 300,
}
