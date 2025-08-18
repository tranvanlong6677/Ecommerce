import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UPLOAD_PATH } from './shared/constants/other.constants'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  app.useStaticAssets(UPLOAD_PATH)
  // app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(process.env.PORT ?? 8000)
}
bootstrap()
