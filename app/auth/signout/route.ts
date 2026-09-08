import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}

// Compatibility for old bookmarks: GET never mutates authentication state.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}
