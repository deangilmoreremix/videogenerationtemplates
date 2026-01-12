'use client'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span className={`text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {todo.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-600 hover:text-red-800 focus:outline-none"
      >
        Delete
      </button>
    </div>
  )
}