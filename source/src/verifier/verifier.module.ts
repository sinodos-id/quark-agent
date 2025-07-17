import { Module } from '@nestjs/common';
import { VerifierController } from './verifier.controller';
import { CoreModule } from '../core/core.module';
import { PresentationWebhookController } from './presentation-webhook.controller';

// TODO: A better structure would be to have a dedicated AgentModule that provides
// and exports the AgentProvider and other core services. This would avoid
// providing them directly here and in the AppModule.
import { SseService } from './sse.service';

@Module({
  imports: [CoreModule],
  controllers: [VerifierController, PresentationWebhookController],
  providers: [SseService],
})
export class VerifierModule {}