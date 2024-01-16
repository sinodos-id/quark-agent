import {
  Agent,
  WACICredentialOfferSucceded,
  WACIProtocol,
} from '@extrimian/agent';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { FactoryProvider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as crypto from 'crypto';
import { DateTime } from 'luxon';
import { FileSystemStorage } from '../storage/filesystem-storage';
import { SsiIntegrationService } from './ssi-integration.service';
import { InputDescriptor } from '@extrimian/waci';
import { VerifiableCredentialWithInfo } from '@extrimian/agent/dist/vc/protocols/waci-protocol';
import axios from 'axios';
import { CONFIG , Configuration } from 'src/config';

export const WaciProtocolProvider: FactoryProvider<WACIProtocol> = {
  provide: WACIProtocol,
  inject: [SsiIntegrationService, VerifiableCredentialService, ModuleRef , CONFIG],
  useFactory: async (
    ssiIntegrationService: SsiIntegrationService,
    verifiableCredentialService: VerifiableCredentialService,
    moduleRef: ModuleRef,
    config: Configuration,
  ) => {
    return new WACIProtocol({
      storage: new FileSystemStorage({ filepath: './waci-storage.json' }),
      issuer: {
        issueCredentials: async (
          waciInvitationId: string,
          holderDid: string,
        ) => {
          let agent: Agent;

          try {
            agent = moduleRef.get(Agent, { strict: false });
          } catch (e) {
            throw Error('Resolving agent instance failed');
          }
          
          try {
            const didHolder = (holderDid.split(':'))[3];
            const response = await axios.post(
              config.SSI_INTEGRATION_API_URL + '/did/storage',
              { did: didHolder, invitation: waciInvitationId }
            );
            console.log('SAVE DID RESULT', response);
          } catch (e) {
            console.log('SAVE DID WENT WRONG', e);
          }


          const issuerDid = agent.identity.getOperationalDID().value;
          const credentialsData =
            await ssiIntegrationService.getCredentialsDataByInvitationId<any[]>(
              waciInvitationId,
            );

          const credentials = await Promise.all(
            credentialsData.map(async (credentialData) => {
              const expirationDate = credentialData.lifespanInSeconds
                ? DateTime.now()
                    .plus({ second: credentialData.lifespanInSeconds })
                    .toJSDate()
                : undefined;
              const vcId = crypto.randomUUID();

              const params = {
                data: {
                  ...credentialData.data,
                  id: holderDid,
                },
                mappingRules: credentialData.mappingRulesDescriptor,
                context: credentialData.contexts,
                vcInfo: {
                  ...credentialData.vcInfo,
                  expirationDate,
                  id: vcId,
                  issuer: credentialData.vcInfo.issuer
                    ? { id: issuerDid, name: credentialData.vcInfo.issuer }
                    : issuerDid,
                  credentialStatus: credentialData.credentialStatusUrl
                    ? {
                        id: `${credentialData.credentialStatusUrl}/${vcId}`,
                        type: 'CredentialStatusList2017',
                      }
                    : undefined,
                },
              };

              const credential =
                await verifiableCredentialService.createCredential(params);

              return {
                credential,
                outputDescriptor: credentialData.outputDescriptor,
              };
            }),
          );

          const issuer = {
            name: credentialsData?.[0]?.vcInfo?.issuer,
            styles: credentialsData?.[0]?.issuerStyles,
          };

          return new WACICredentialOfferSucceded({
            credentials,
            issuer,
            options: {
              challenge: crypto.randomUUID(),
              domain: `${
                holderDid ? holderDid + ';' : ''
              }${crypto.randomUUID()}`,
            },
            inputDescriptors: credentialsData?.[0].inputDescriptors,
          });
        },
      },
      verifier: {
        presentationDefinition: async (waciInvitationId: string) => {
          const presentationContext =
            await ssiIntegrationService.getPresentationContextsByInvitationId<any>(
              waciInvitationId,
            );

          return {
            inputDescriptors: presentationContext.inputDescriptors,
          };
        },
      },
      holder: {
        credentialApplication: async (
          inputs: {
            descriptor: InputDescriptor;
            credentials: VerifiableCredentialWithInfo[];
          }[],
        ) => {
          return inputs.map((input) => {
            if (!input.credentials.length)
              throw Error('No credentials found for input descriptor');
            return input.credentials[0].data;
          });
        },
      },
    });
  },
};
