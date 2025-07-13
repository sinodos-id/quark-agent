import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { WaciIssueCredentialDataMongoService } from './services/waci-issue-credential-data-mongo.service';
import { WaciPresentationDataService } from './services/waci-presentation-memory.service';
import { WaciPresentationMongoService } from './services/waci-presentation-mongo.service';
import { InvitationProcessingService } from './services/invitation-processing.service';
import {
  WaciIssueCredentialData,
  WaciIssueCredentialDataSchema,
} from './schemas/waci-issue-credential-data.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CredentialBuilderService } from './services/credential-builder.service';
import { CorrelationMiddleware } from './middleware/correlation.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WaciPresentationModule } from './waci-presentation/waci-presentation.module';
@Module({
  imports: [
    AuthModule,
    WebhooksModule,
    ConfigModule,
    MongoConfigModule,
    WaciPresentationModule,
    StorageModule,
    MongooseModule.forFeature([
      {
        name: WaciIssueCredentialData.name,
        schema: WaciIssueCredentialDataSchema,
      },
    ]),
  ],
  controllers: [HealthController, AppController],
  providers: [
    VerifiableCredentialService,
    WebsocketServerTransport,
    WACIProtocolProvider,
    AgentProvider,
    MessagingGateway,
    WaciIssueCredentialDataMongoService,
    WaciPresentationDataService,
    WaciPresentationMongoService,
    CredentialBuilderService,
    InvitationProcessingService,
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
