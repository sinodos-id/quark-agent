import { Module } from '@nestjs/common';
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

@Module({
  imports: [AuthModule],
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
    WACIProtocolProvider,
    ConfigProvider,
    {
      provide: 'AGENT_SECURE_STORAGE',
      useClass: JsonStorage,
    },
    AgentProvider,
    MessagingGateway,
  ],
})
export class AppModule {}
