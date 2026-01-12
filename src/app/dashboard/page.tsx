'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AddTodo from '@/components/AddTodo'

const TodoList = dynamic(() => import('@/components/TodoList'), {
  loading: () => <p>Loading todos...</p>,
})

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTodos()
  }, [router])

  const fetchTodos = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const response = await fetch('/api/todos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshToken()
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        fetchTodos()
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const addTodo = async (title: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })
      if (response.ok) {
        const newTodo = await response.json()
        setTodos([newTodo, ...todos])
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleTodo = async (id: number) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      })
      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(t => t.id === id ? updatedTodo : t))
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AddTodo onAdd={addTodo} />
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </div>
      </main>
    </div>
  )
}