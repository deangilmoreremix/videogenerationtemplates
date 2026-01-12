import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect API routes that require authentication
  if (pathname.startsWith('/api/todos')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Add user info to headers for use in API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId.toString())
    response.headers.set('x-user-email', payload.email)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}