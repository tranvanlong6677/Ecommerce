import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
// import { TransformInterceptor } from './shared/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  // app.useGlobalInterceptors(new TransformInterceptor())
  await app.listen(process.env.PORT ?? 8000)
}
bootstrap()
