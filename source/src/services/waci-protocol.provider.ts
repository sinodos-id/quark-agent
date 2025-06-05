import { Provider } from '@nestjs/common';
import { WACIProtocol } from '@extrimian/agent';
import { MongoStorage } from '../storage/mongo-storage';
import { CONFIG } from '../config';
import { WaciCredentialDataService } from './waci-credential-data.service';
import { WaciPresentationMongoService } from './waci-presentation-mongo.service';
import { Logger } from '../utils/logger';
import { CredentialBuilderService } from './credential-builder.service';
import { OutgoingWebhookService } from './outgoing-webhook.service'; // Import the new service

export const WACIProtocolProvider: Provider = {
  provide: WACIProtocol,
  useFactory: (
    config: any,
    waciCredentialDataService: WaciCredentialDataService,
    waciPresentationDataService: WaciPresentationMongoService,
    credentialBuilder: CredentialBuilderService,
    outgoingWebhookService: OutgoingWebhookService, // Inject the new service
  ) => {
    return new WACIProtocol({
      storage: new MongoStorage('vc_storage'),
      issuer: {
        issueCredentials: async (
          waciInvitationId: string,
          holderId: string,
        ) => {
          Logger.log('🔄 WACI Protocol: Starting credential issuance', {
            invitationId: waciInvitationId,
            holderId,
          });

          const storedData =
            waciCredentialDataService.getData(waciInvitationId);

          if (!storedData) {
            const errorMessage = `❌ No credential data found for invitation ID: ${waciInvitationId}`;
            Logger.error(errorMessage, null, {
              invitationId: waciInvitationId,
              holderId,
            });
            throw new Error(errorMessage);
          }

          const {
            issuerDid,
            nameDid,
            credentialSubject,
            options,
            styles,
            issuer,
          } = storedData;

          const issuerInfo = {
            id: issuerDid,
            name: nameDid ?? 'Credential Issuer',
            styles: issuer?.styles,
          };

          // Build the raw credential data for the webhook payload
          const credentialData = credentialBuilder.buildCredentialData(
            waciInvitationId,
            holderId,
            issuerInfo,
            credentialSubject,
            options,
            styles,
          );

          const credentialOffer = credentialBuilder.createCredentialOffer(
            waciInvitationId,
            holderId,
            issuerInfo,
            credentialSubject,
            options,
            styles,
          );

          Logger.log('✅ WACI Protocol: Credential issuance completed', {
            invitationId: waciInvitationId,
            holderId,
          });

          // Send the outgoing webhook for credential issued
          // Pass the actual VC data and the holder's DID
          await outgoingWebhookService.sendCredentialIssuedWebhook(
            credentialData, // Use the built credentialData
            holderId,
          );

          // waciCredentialDataService.removeData(waciInvitationId);

          return credentialOffer;
        },
      },
      verifier: {
        presentationDefinition: async (invitationId: string) => {
          const storedPresentationData =
            await waciPresentationDataService.getData(invitationId);

          Logger.debug('Processing presentation definition', {
            invitationId,
            hasStoredData: !!storedPresentationData,
          });

          if (storedPresentationData) {
            return {
              inputDescriptors: storedPresentationData,
            };
          }
        },
      },
    });
  },
  inject: [
    CONFIG,
    WaciCredentialDataService,
    WaciPresentationMongoService,
    CredentialBuilderService,
    OutgoingWebhookService, // Add the new service to the inject array
  ],
};
