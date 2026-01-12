import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteCache } from '@/lib/redis'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id') || '0')
    const { id } = await params
    const idNum = parseInt(id)

    const todo = await prisma.todo.findFirst({
      where: { id: idNum, userId },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Get todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id') || '0')
    const { id } = await params
    const idNum = parseInt(id)
    const { title, completed } = await request.json()

    const todo = await prisma.todo.findFirst({
      where: { id: idNum, userId },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: idNum },
      data: { title, completed },
    })

    // Invalidate cache
    const cacheKey = `todos:${userId}`
    await deleteCache(cacheKey)

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Update todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id') || '0')
    const { id } = await params
    const idNum = parseInt(id)

    const todo = await prisma.todo.findFirst({
      where: { id: idNum, userId },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await prisma.todo.delete({
      where: { id: idNum },
    })

    // Invalidate cache
    const cacheKey = `todos:${userId}`
    await deleteCache(cacheKey)

    return NextResponse.json({ message: 'Todo deleted' })
  } catch (error) {
    console.error('Delete todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}