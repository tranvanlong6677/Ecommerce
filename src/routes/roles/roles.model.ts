import { z } from 'zod'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
})

export type RoleType = z.infer<typeof RoleSchema>
