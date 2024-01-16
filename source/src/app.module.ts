import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { SsiIntegrationService } from './services/ssi-integration.service';
import { WaciProtocolProvider } from './services/waci-protocol.provider';
import { AppController } from './controllers/app.controller';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from './controllers/messaging.gateway';
import { ConfigProvider } from './config';
import { WebsocketServerTransport } from '@extrimian/agent';
import { VaultStorage } from './storage/vault-storage';
import { AgentProvider } from './services/agent.provider';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    // MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule
  ],
  controllers: [HealthController, AppController],
  providers: [
    {
      provide: VerifiableCredentialService,
      useClass: VerifiableCredentialService,
    },
    {
      provide: WebsocketServerTransport,
      useClass: WebsocketServerTransport,
    },
    ConfigProvider,
    VaultStorage,
    AgentProvider,
    WaciProtocolProvider,
    SsiIntegrationService,
    MessagingGateway,
  ],
})
export class AppModule {}
