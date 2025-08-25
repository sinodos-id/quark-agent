import { Module } from '@nestjs/common';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from '../controllers/messaging.gateway';
import { WebsocketServerTransport } from '@extrimian/agent';
import { ConfigModule } from '../config/config.module';
import { StorageModule } from '../storage/storage.module';
import { AgentProvider } from '../services/agent.provider';
import { WACIProtocolProvider } from '../services/waci-protocol.provider';
import { WaciPresentationDataService } from '../services/waci-presentation-memory.service';
import { InvitationProcessingService } from '../services/invitation-processing.service';
import { CredentialBuilderService } from '../services/credential-builder.service';

const CORE_PROVIDERS = [
  VerifiableCredentialService,
  WebsocketServerTransport,
  WACIProtocolProvider,
  AgentProvider,
  MessagingGateway,
  WaciPresentationDataService,
  CredentialBuilderService,
  InvitationProcessingService,
];

import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [ConfigModule, StorageModule, WebhooksModule],
  providers: CORE_PROVIDERS,
  exports: [ConfigModule, ...CORE_PROVIDERS],
})
export class CoreModule {}