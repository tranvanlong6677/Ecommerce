import { z } from 'zod'

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

export const GetLanguagesResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict()

export const GetLanguageResSchema = z.object({
  data: LanguageSchema,
})

export const CreateLanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string(),
})

export const UpdateLanguageSchema = z.object({
  name: z.string(),
})

export type CreateLanguageSchemaType = z.infer<typeof CreateLanguageSchema>
export type UpdateLanguageSchemaType = z.infer<typeof UpdateLanguageSchema>
export type LanguageSchemaType = z.infer<typeof LanguageSchema>
