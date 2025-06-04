import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AppController } from './controllers/app.controller';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from './controllers/messaging.gateway';
import { ConfigProvider } from './config';
import { WebsocketServerTransport } from '@extrimian/agent';
import { JsonStorage } from './storage/memory-storage';
import { AgentProvider } from './services/agent.provider';
import { AuthModule } from './auth/auth.module';
import { WACIProtocolProvider } from './services/waci-protocol.provider';
import { WaciCredentialDataService } from './services/waci-credential-data.service';
import { WaciPresentationDataService } from './services/waci-presentation-data.service';
import { INJECTION_TOKENS } from './constants/injection-tokens';
import { CredentialBuilderService } from './services/credential-builder.service';
import { CorrelationMiddleware } from './middleware/correlation.middleware'; // Import CorrelationMiddleware

@Module({
  imports: [AuthModule],
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
      useClass: JsonStorage,
    },
    WACIProtocolProvider,
    ConfigProvider,
    AgentProvider,
    MessagingGateway,
    WaciCredentialDataService,
    WaciPresentationDataService,
    CredentialBuilderService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
