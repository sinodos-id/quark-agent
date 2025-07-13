// src/webhooks/dtos/outgoing-webhook.dto.ts

export interface OutgoingWebhookPayload {
  eventType: string;
  eventData:
    | CredentialIssuedEventData
    | VerifiablePresentationFinishedEventData;
}

export interface CredentialIssuedEventData {
  vc: any;
  holderDID: string;
}

export interface VerifiablePresentationFinishedEventData {
  invitationId: string;
  verified: boolean;
  verifiableCredentials: Array<{
    id: string;
  }>;
  holderDID: string;
  [key: string]: any;
  webhookUrl?: string;
}
