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

  private async sendWebhook(
    eventType: string,
    eventData:
      | VerifiablePresentationFinishedEventData
      | CredentialIssuedEventData,
  ): Promise<void> {
    const webhookUrl = this.getWebhookUrl(eventData);

    Logger.debug(`Attempting to send ${eventType} webhook: ${webhookUrl}`);

    if (!webhookUrl) {
      return;
    }

    const payload: OutgoingWebhookPayload = {
      eventType,
      eventData,
    };

    try {
      await firstValueFrom(
        this.httpService.put(webhookUrl, payload, {
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
        url: webhookUrl,
        payload,
      });
    }
  }

  private getWebhookUrl(
    eventData:
      | VerifiablePresentationFinishedEventData
      | CredentialIssuedEventData,
  ): string | undefined {
    const isProd = process.env.NODE_ENV === 'production';
    let webhookUrl: string;

    if ('webhookUrl' in eventData) {
      webhookUrl = eventData?.webhookUrl;
    }

    if (!webhookUrl) {
      webhookUrl = isProd
        ? this.config.PROD_WEBHOOK_URL
        : this.config.TEST_WEBHOOK_URL;

      Logger.warn(
        `${isProd ? 'Production' : 'Test'} webhook URL not configured`,
      );
    }

    return webhookUrl;
  }
}
