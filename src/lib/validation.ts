import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  completed: z.boolean().optional(),
})