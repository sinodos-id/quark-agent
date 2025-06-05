import { FactoryProvider } from '@nestjs/common';
import { CONFIG, Configuration } from '../config';
import { MongoStorage } from '../storage/mongo-storage';
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
import { WaciPresentationDataService } from './waci-presentation-data.service';

export const AgentProvider: FactoryProvider<Agent> = {
  provide: Agent,
  inject: [
    INJECTION_TOKENS.AGENT_SECURE_STORAGE,
    WACIProtocol,
    INJECTION_TOKENS.WEBSOCKET_TRANSPORT,
    CONFIG,
    OutgoingWebhookService,
    WaciPresentationDataService,
  ],
  useFactory: async (
    secureStorage: AgentSecureStorage,
    waciProtocol: WACIProtocol,
    transport: WebsocketServerTransport,
    config: Configuration,
    outgoingWebhookService: OutgoingWebhookService,
    waciPresentationDataService: WaciPresentationDataService,
  ) => {
    const agent = new Agent({
      didDocumentRegistry: new AgentModenaUniversalRegistry(config.MODENA_URL),
      didDocumentResolver: new AgentModenaUniversalResolver(config.MODENA_URL),
      vcProtocols: [waciProtocol],
      supportedTransports: [new WebsocketClientTransport()],
      agentStorage: new MongoStorage('agent_storage'),
      vcStorage: new MongoStorage('vc_storage'),
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

      const firstVc = param.vcs?.[0] as any;
      const holderDID =
        firstVc?.holder ||
        firstVc?.credentialSubject?.id ||
        firstVc?.data?.holder ||
        'unknown';

      let originalInvitationId =
        waciPresentationDataService.getInvitationIdFromThread(param.thid);

      // If no thread mapping found, try to find any invitation ID with stored data
      if (!originalInvitationId) {
        originalInvitationId =
          waciPresentationDataService.findInvitationIdWithData();
      }

      const presentationEventData: VerifiablePresentationFinishedEventData = {
        invitationId: originalInvitationId || param.thid, // Use mapped invitation ID or fallback to thid
        verified: param.verified,
        verifiableCredentials:
          param.vcs?.map((vc) => ({
            id: vc.id,
          })) || [],
        holderDID,
        thid: param.thid,
        messageId: param.messageId,
      };

      Logger.debug('Presentation verified - ID mapping', {
        thid: param.thid,
        originalInvitationId,
        usingInvitationId: originalInvitationId || param.thid,
        allStoredIds: waciPresentationDataService.getAllStoredInvitationIds(),
      });
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
        fullData: data, // Log the full data to see what's available
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
