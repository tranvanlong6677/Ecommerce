import * as fs from 'fs'
import * as path from 'path'
import z from 'zod'
import { config } from 'dotenv'

config({
  path: '.env',
})

// Kiểm tra xem có file .env chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file env')
  process.exit(1)
}

export const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URL: z.string(),
  GOOGLE_CLIENT_REDIRECT_URL: z.string(),
  APP_NAME: z.string(),
  APP_URL: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
})

const configServer = configSchema.safeParse(process.env)
if (!configServer.success) {
  console.log('Các giá trị trong file env không hợp lệ')
  console.error(configServer.error)
  process.exit()
}

const envConfig = configServer.data

export default envConfig
