import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthController } from './controllers/health.controller';
import { MongoConfigModule } from './storage/mongo/mongo-config.module';
import { AppController } from './controllers/app.controller';
import { ConfigModule } from './config/config.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { CorrelationMiddleware } from './middleware/correlation.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WaciPresentationModule } from './waci-presentation/waci-presentation.module';
import { VerifierModule } from './verifier/verifier.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '',
      renderPath: '*',
    }),
    CoreModule,
    VerifierModule,
    AuthModule,
    WebhooksModule,
    ConfigModule,
    MongoConfigModule,
    WaciPresentationModule,
    StorageModule,
  ],
  controllers: [HealthController, AppController],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
