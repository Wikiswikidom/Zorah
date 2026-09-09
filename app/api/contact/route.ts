import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

const recentSubmissions = new Map<string, number>()
const RATE_WINDOW_MS = 60_000

function rateLimited(key: string) {
  const now = Date.now()
  for (const [storedKey, timestamp] of recentSubmissions) {
    if (now - timestamp > RATE_WINDOW_MS) recentSubmissions.delete(storedKey)
  }
  const previous = recentSubmissions.get(key)
  if (previous && now - previous < RATE_WINDOW_MS) return true
  recentSubmissions.set(key, now)
  return false
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 })
    }

    const name = clean((body as Record<string, unknown>).name, 160)
    const email = clean((body as Record<string, unknown>).email, 320).toLowerCase()
    const phone = clean((body as Record<string, unknown>).phone, 40)
    const subject = clean((body as Record<string, unknown>).subject, 160)
    const message = clean((body as Record<string, unknown>).message, 5000)
    const honeypot = clean((body as Record<string, unknown>).website, 40)

    // Silent success for simple bots that fill the hidden field.
    if (honeypot) return NextResponse.json({ ok: true })
    if (name.length < 2 || !emailPattern.test(email) || message.length < 2) {
      return NextResponse.json({ error: 'Please enter your name, a valid email and a message.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    if (rateLimited(`${ip}:${email}`)) {
      return NextResponse.json({ error: 'Please wait a moment before sending another enquiry.' }, { status: 429 })
    }

    const supabase = createAdminClient()
    const { count } = await supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 10 * 60_000).toISOString())

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Please wait a little before sending another enquiry.' }, { status: 429 })
    }

    const { error } = await supabase.from('contact_requests').insert({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      source: 'landing',
      status: 'new',
    })

    if (error) {
      console.error('Contact request insert failed', error)
      return NextResponse.json({ error: 'We could not send your message. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact request failed', error)
    return NextResponse.json({ error: 'We could not send your message. Please try again.' }, { status: 500 })
  }
}
