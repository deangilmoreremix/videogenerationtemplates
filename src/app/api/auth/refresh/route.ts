import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken, verifyRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 })
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email })

    return NextResponse.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}