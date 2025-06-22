import z from 'zod'

export const MessageResSchema = z.object({
  message: z.string(),
})

export const BaseResSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  data: z.any().optional(),
})

export type MessageResType = z.infer<typeof MessageResSchema>
export type BaseResType = z.infer<typeof BaseResSchema>
