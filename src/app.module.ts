import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './shared/filters/http.exception.filter'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { LanguageModule } from './routes/language/language.module'
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionsModule } from './src/routes/permissions/permissions.module';

@Module({
  imports: [SharedModule, AuthModule, LanguageModule, PermissionsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
