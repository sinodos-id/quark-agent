import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Configuration, CONFIG } from '../config';
import { Logger } from '../utils/logger';
import {
  OutgoingWebhookPayload,
  CredentialIssuedEventData,
  VerifiablePresentationFinishedEventData,
} from '../webhooks/dtos/outgoing-webhook.dto';

@Injectable()
export class OutgoingWebhookService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CONFIG) private readonly config: Configuration,
  ) {}

  async sendCredentialIssuedWebhook(
    vc: Record<string, unknown>,
    holderDID: string,
  ): Promise<void> {
    const eventData: CredentialIssuedEventData = {
      vc,
      holderDID,
    };
    await this.sendWebhook('credential-issued', eventData);
  }

  async sendVerifiablePresentationFinishedWebhook(
    eventData: VerifiablePresentationFinishedEventData,
  ): Promise<void> {
    await this.sendWebhook('verifiable-presentation-finished', eventData);
  }

  private async sendWebhook<T>(eventType: string, eventData: T): Promise<void> {
    Logger.log(`Attempting to send ${eventType} webhook`);
    const webhookUrl = this.getWebhookUrl();

    if (!webhookUrl) {
      Logger.warn(
        `Outgoing webhook URL not configured for ${eventType} event.`,
      );
      return;
    }

    const payload: OutgoingWebhookPayload = {
      eventType,
      eventData,
    };

    const endpoint = `${webhookUrl}/api/admin/webhook`;

    try {
      await firstValueFrom(
        this.httpService.put(endpoint, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      Logger.log(`${eventType} webhook sent successfully.`);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { status?: number; data?: unknown };
      };
      Logger.error(`Failed to send ${eventType} webhook.`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: endpoint,
        payload,
      });
    }
  }

  private getWebhookUrl(): string | undefined {
    const isProd = process.env.NODE_ENV === 'production';
    const url = isProd
      ? this.config.PROD_WEBHOOK_URL
      : this.config.TEST_WEBHOOK_URL;

    if (!url) {
      Logger.warn(
        `${isProd ? 'Production' : 'Test'} webhook URL not configured`,
      );
    }

    return url;
  }
}
