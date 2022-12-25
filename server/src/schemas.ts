import { z } from 'zod'

export const signInSchema = z.object({
  name: z.string(),
})

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const messageSchema = z.object({
  message: z.string(),
  user: userSchema,
})
