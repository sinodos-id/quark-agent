import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { MongoConfigModule } from './storage/mongo/mongo-config.module';
import { AppController } from './controllers/app.controller';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from './controllers/messaging.gateway';
import { WebsocketServerTransport } from '@extrimian/agent';
import { ConfigModule } from './config/config.module';
import { StorageModule } from './storage/storage.module';
import { AgentProvider } from './services/agent.provider';
import { AuthModule } from './auth/auth.module';
import { WACIProtocolProvider } from './services/waci-protocol.provider';
import { WaciCredentialDataService } from './services/waci-credential-data.service';
import { WaciPresentationDataService } from './services/waci-presentation-data.service';
import { WaciPresentationMongoService } from './services/waci-presentation-mongo.service';
import { CredentialBuilderService } from './services/credential-builder.service';
import { CorrelationMiddleware } from './middleware/correlation.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WaciPresentationModule } from './waci-presentation/waci-presentation.module';
@Module({
  imports: [
    AuthModule,
    forwardRef(() => WebhooksModule),
    // WebhooksModule,
    ConfigModule,
    MongoConfigModule,
    WaciPresentationModule,
    StorageModule,
  ],
  controllers: [HealthController, AppController],
  providers: [
    VerifiableCredentialService,
    WebsocketServerTransport,
    WACIProtocolProvider,
    AgentProvider,
    MessagingGateway,
    WaciCredentialDataService,
    WaciPresentationDataService,
    WaciPresentationMongoService,
    CredentialBuilderService,
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
