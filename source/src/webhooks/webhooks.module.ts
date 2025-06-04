import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OutgoingWebhookService } from '../services/outgoing-webhook.service';
import { ConfigProvider } from '../config';

@Module({
  imports: [HttpModule],
  providers: [OutgoingWebhookService, ConfigProvider],
  exports: [OutgoingWebhookService],
})
export class WebhooksModule {}
