import { Provider } from '@nestjs/common';
import { WACIProtocol } from '@extrimian/agent';
import { FileSystemStorage } from '../storage/filesystem-storage';
import { CONFIG } from '../config';
import { WaciCredentialDataService } from './waci-credential-data.service';
import { WaciPresentationDataService } from './waci-presentation-data.service';
import { Logger } from '../utils/logger';
import { CredentialBuilderService } from './credential-builder.service';

export const WACIProtocolProvider: Provider = {
  provide: WACIProtocol,
  useFactory: (
    config: any,
    waciCredentialDataService: WaciCredentialDataService,
    waciPresentationDataService: WaciPresentationDataService,
    credentialBuilder: CredentialBuilderService,
  ) => {
    return new WACIProtocol({
      storage: new FileSystemStorage({
        filepath: './storage/waci-storage.json',
      }),
      issuer: {
        issueCredentials: async (
          waciInvitationId: string,
          holderId: string,
        ) => {
          const storedData =
            waciCredentialDataService.getData(waciInvitationId);

          if (!storedData) {
            const errorMessage = `No credential data found for invitation ID: ${waciInvitationId}`;
            Logger.error(errorMessage);
            throw new Error(errorMessage);
          }

          Logger.debug('Processing credential data', {
            invitationId: waciInvitationId,
            holderId,
            types: storedData.options.type,
          });

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

          const credentialOffer = credentialBuilder.createCredentialOffer(
            waciInvitationId,
            holderId,
            issuerInfo,
            credentialSubject,
            {
              title: options.displayTitle,
              subtitle: options.displaySubtitle,
              description: options.displayDescription,
              type: options.type,
              expirationDays: options.expirationDays,
            },
            styles,
          );

          Logger.debug('Removing credential data after processing', {
            invitationId: waciInvitationId,
          });
          waciCredentialDataService.removeData(waciInvitationId);

          return credentialOffer;
        },
      },
      verifier: {
        presentationDefinition: async (invitationId: string) => {
          const storedPresentationData =
            waciPresentationDataService.getData(invitationId);

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
    WaciPresentationDataService,
    CredentialBuilderService,
  ],
};
