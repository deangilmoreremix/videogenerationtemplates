import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, deleteCache } from '@/lib/redis'
import { createTodoSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('x-user-id') || '0')
    const cacheKey = `todos:${userId}`

    // Check cache first
    const cachedTodos = await getCache(cacheKey)
    if (cachedTodos) {
      return NextResponse.json(JSON.parse(cachedTodos))
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Cache for 5 minutes
    await setCache(cacheKey, JSON.stringify(todos), 300)

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Get todos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = parseInt(request.headers.get('x-user-id') || '0')
    const body = await request.json()
    const validation = createTodoSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { title } = validation.data

    const todo = await prisma.todo.create({
      data: { title, userId },
    })

    // Invalidate cache
    const cacheKey = `todos:${userId}`
    await deleteCache(cacheKey)

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Create todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}