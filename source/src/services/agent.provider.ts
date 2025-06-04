import { FactoryProvider } from '@nestjs/common';
import { CONFIG, Configuration } from '../config';
import { FileSystemStorage } from '../storage/filesystem-storage';
import {
  Agent,
  AgentSecureStorage,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  WACIProtocol,
  WebsocketServerTransport,
  WebsocketClientTransport,
} from '@extrimian/agent';
import { INJECTION_TOKENS } from '../constants/injection-tokens';
import { Logger } from '../utils/logger';
import { OutgoingWebhookService } from './outgoing-webhook.service';
import { VerifiablePresentationFinishedEventData } from '../webhooks/dtos/outgoing-webhook.dto';

export const AgentProvider: FactoryProvider<Agent> = {
  provide: Agent,
  inject: [
    INJECTION_TOKENS.AGENT_SECURE_STORAGE,
    WACIProtocol,
    INJECTION_TOKENS.WEBSOCKET_TRANSPORT,
    CONFIG,
    OutgoingWebhookService,
  ],
  useFactory: async (
    secureStorage: AgentSecureStorage,
    waciProtocol: WACIProtocol,
    transport: WebsocketServerTransport,
    config: Configuration,
    outgoingWebhookService: OutgoingWebhookService,
  ) => {
    const agent = new Agent({
      didDocumentRegistry: new AgentModenaUniversalRegistry(config.MODENA_URL),
      didDocumentResolver: new AgentModenaUniversalResolver(config.MODENA_URL),
      vcProtocols: [waciProtocol],
      supportedTransports: [new WebsocketClientTransport()],
      agentStorage: new FileSystemStorage({
        filepath: './storage/agent-storage.json',
      }),
      vcStorage: new FileSystemStorage({
        filepath: './vc-storage.json',
      }),
      secureStorage,
    });

    await agent.initialize();
    const dids = agent.identity.getDIDs();
    if (!dids.length) {
      await agent.identity.createNewDID({
        didMethod: config.DID_METHOD,
        dwnUrl: config.DWN_URL,
        services: config.WEBSOCKET_ENDPOINT_URL
          ? [
              {
                id: 'websocket',
                type: config.WEBSOCKET_ENDPOINT_ID,
                serviceEndpoint: config.WEBSOCKET_ENDPOINT_URL,
              },
            ]
          : undefined,
      });
    }

    agent.vc.ackCompleted.on((param) => {
      Logger.debug('Acknowledgment completed', { param });
    });

    agent.vc.presentationVerified.on(async (param) => {
      Logger.debug('Presentation verified', { param });

      // Extract holderDID from the verifiable credential
      // VerifiableCredential might have holder in different locations
      const firstVc = param.vcs?.[0] as any;
      const holderDID =
        firstVc?.holder ||
        firstVc?.credentialSubject?.id ||
        firstVc?.data?.holder ||
        'unknown';

      const presentationEventData: VerifiablePresentationFinishedEventData = {
        invitationId: param.messageId, // Use messageId as the invitationId
        verified: param.verified,
        verifiableCredentials:
          param.vcs?.map((vc) => ({
            id: vc.id,
          })) || [],
        holderDID,
        thid: param.thid,
        messageId: param.messageId,
      };
      try {
        await outgoingWebhookService.sendVerifiablePresentationFinishedWebhook(
          presentationEventData,
        );
      } catch (error) {
        Logger.error('Error sending presentation verified webhook', error);
      }
    });

    agent.vc.credentialArrived.on(async (vcs) => {
      Logger.debug('Processing arrived credentials', {
        count: vcs.credentials.length,
      });
      await Promise.all(
        vcs.credentials.map((vc) => {
          agent.vc.saveCredentialWithInfo(vc.data, {
            styles: vc.styles,
            display: vc.display,
          });
        }),
      );
      // TODO: Map vcs data to webhook payload structure
      // Assuming vcs.credentials[0].data is the VC and vcs.holderDID is available
      // This mapping needs refinement based on the actual structure of vcs
      try {
        await outgoingWebhookService.sendCredentialIssuedWebhook(
          vcs.credentials[0].data, // Placeholder, needs proper mapping
          vcs.credentials[0].data.holder, // Accessing holder DID from the VC data
        );
      } catch (error) {
        Logger.error('Error sending credential arrived webhook', error);
      }
    });

    agent.vc.credentialPresented.on((data) => {
      Logger.debug('Credential presented', {
        vcVerified: data.vcVerified,
        presentationVerified: data.presentationVerified,
        vcId: data.vc.id,
      });
    });

    agent.vc.problemReport.on((data) => {
      Logger.error('Problem report received', {
        did: data.did.value,
        code: data.code,
        invitationId: data.invitationId,
        messageId: data.messageId,
      });
    });

    return agent;
  },
};
