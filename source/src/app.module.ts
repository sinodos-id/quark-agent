import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { MongoConfigModule } from './storage/mongo/mongo-config.module';
import { AppController } from './controllers/app.controller';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from './controllers/messaging.gateway';
import { ConfigProvider } from './config';
import { WebsocketServerTransport } from '@extrimian/agent';
import { MongoStorage } from './storage/mongo-storage';
import { AgentProvider } from './services/agent.provider';
import { AuthModule } from './auth/auth.module';
import { WACIProtocolProvider } from './services/waci-protocol.provider';
import { WaciCredentialDataService } from './services/waci-credential-data.service';
import { WaciPresentationDataService } from './services/waci-presentation-data.service';
import { WaciPresentationMongoService } from './services/waci-presentation-mongo.service';
import { INJECTION_TOKENS } from './constants/injection-tokens';
import { CredentialBuilderService } from './services/credential-builder.service';
import { CorrelationMiddleware } from './middleware/correlation.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WaciPresentationModule } from './waci-presentation/waci-presentation.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => WebhooksModule),
    MongoConfigModule,
    WaciPresentationModule,
  ],
  controllers: [HealthController, AppController],
  providers: [
    {
      provide: INJECTION_TOKENS.VERIFIABLE_CREDENTIAL_SERVICE,
      useClass: VerifiableCredentialService,
    },
    {
      provide: INJECTION_TOKENS.WEBSOCKET_TRANSPORT,
      useClass: WebsocketServerTransport,
    },
    {
      provide: INJECTION_TOKENS.AGENT_SECURE_STORAGE,
      useFactory: () => new MongoStorage('secure_storage'),
    },
    WACIProtocolProvider,
    ConfigProvider,
    AgentProvider,
    MessagingGateway,
    WaciCredentialDataService,
    WaciPresentationDataService,
    WaciPresentationMongoService,
    CredentialBuilderService,
  ],
  exports: [ConfigProvider],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
