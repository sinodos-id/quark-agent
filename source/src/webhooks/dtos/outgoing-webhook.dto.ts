// src/webhooks/dtos/outgoing-webhook.dto.ts

export interface OutgoingWebhookPayload {
  eventType: string;
  eventData: any; // This will be one of the specific event data types
}

export interface CredentialIssuedEventData {
  vc: any; // Full verifiable credential object
  holderDID: string;
}

export interface VerifiablePresentationFinishedEventData {
  invitationId: string;
  verified: boolean;
  verifiableCredentials: Array<{
    id: string;
    // Other credential data properties as needed
  }>;
  holderDID: string;
  // Additional metadata preserved as-is
  [key: string]: any;
}

// You can add other event data interfaces here if needed in the future
