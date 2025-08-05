import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict()

export type UpdateProfileBodySchemaType = z.infer<typeof UpdateProfileBodySchema>
