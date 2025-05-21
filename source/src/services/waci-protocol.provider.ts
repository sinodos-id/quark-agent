import { Provider } from '@nestjs/common';
import { WACIProtocol, WACICredentialOfferSucceded } from '@extrimian/agent';
import { FileSystemStorage } from '../storage/filesystem-storage';
import { CONFIG } from '../config';
import { WaciCredentialDataService } from './waci-credential-data.service';

export const WACIProtocolProvider: Provider = {
  provide: WACIProtocol,
  useFactory: (config: any, waciCredentialDataService: WaciCredentialDataService) => {
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
            console.error(
              `No credential data found for invitation ID: ${waciInvitationId}`,
            );
            // Depending on desired behavior, you might throw an error or return an empty offer
            throw new Error(
              `No credential data found for invitation ID: ${waciInvitationId}`,
            );
          }

          const {
            issuerDid,
            nameDid,
            credentialSubject,
            options,
            styles,
            issuer,
          } = storedData;

          // Calculate expiration date
          const expirationDate = new Date();
          expirationDate.setDate(
            expirationDate.getDate() + (options.expirationDays || 7),
          );

          // Build the credential data dynamically
          const credentialData = {
            '@context': [
              'https://www.w3.org/2018/credentials/v1',
              'https://w3id.org/security/bbs/v1',
              { "@vocab": "https://www.w3.org/ns/credentials/examples#" }
            ],
            name: options.displayTitle,
            id: `urn:uuid:${waciInvitationId}`, // Using invitationId as credential ID for simplicity
            type: ['VerifiableCredential', ...(options.type || [])], // Include types from options
            issuer: {
              id: issuerDid,
              name: nameDid ?? 'Credential Issuer',
            },
            issuanceDate: new Date(), // Changed to Date object
            expirationDate: expirationDate, // Changed to Date object
            credentialSubject: {
              id: holderId, // Using holderId as credentialSubject ID
              ...credentialSubject,
            },
          };

          const outputDescriptor = {
            id: `${options.type?.[0] || 'credential'}-output`, // Use first type from options or default
            display: {
              title: {
                text: options.displayTitle ?? 'AutoPen Credential',
              },
              subtitle: {
                text: options.displaySubtitle ?? 'Verified Credential',
              },
              description: {
                text: options.displayDescription ?? 'Verifiable Credential',
              },
              properties: Object.entries(credentialSubject).map(
                ([key, value]) => ({
                  path: [`$.credentialSubject.${key}`],
                  fallback: 'Unknown',
                  label: key
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .replace(/^./, (str) => str.toUpperCase()), // Simple formatting
                  schema: {
                    type: typeof value,
                  },
                }),
              ),
            },
            styles: {
              background: {
                color: styles?.background?.color ?? '#0f172a', // Use styles from storedData
              },
              thumbnail: {
                uri:
                  styles?.thumbnail?.uri ??
                  'https://i.imgur.com/DxQW7sh.png',
                alt: styles?.thumbnail?.alt ?? 'Icon VC',
              },
              hero: {
                uri:
                  styles?.hero?.uri ??
                  'https://img.freepik.com/free-vector/modern-circular-halftone-dots-pattern-background_1035-23801.jpg',
                alt: styles?.hero?.alt ?? 'Background VC',
              },
              text: {
                color: styles?.text?.color ?? '#000000',
              },
            },
          };

          const issuerDisplay = {
            name: options.displayTitle || 'Credential Issuer',
            styles: {
              thumbnail: {
                uri:
                  issuer?.styles?.thumbnail?.uri ??
                  'https://dol.wa.com/logo.png',
                alt: issuer?.styles?.thumbnail?.alt ?? 'National University',
              },
              hero: {
                uri:
                  issuer?.styles?.hero?.uri ?? 'https://dol.wa.com/alumnos.png',
                alt: issuer?.styles?.hero?.alt ?? 'University students',
              },
              background: {
                color: issuer?.styles?.background?.color ?? '#ff0000',
              },
              text: {
                color: issuer?.styles?.text?.color ?? '#d4d400',
              },
            },
          };

          // Remove data after use
          waciCredentialDataService.removeData(waciInvitationId);

          return new WACICredentialOfferSucceded({
            options: {
              challenge: 'someChallenge123', // Keep or make dynamic if needed
              domain: 'example.com', // Keep or make dynamic if needed
            },
            credentials: [
              {
                credential: credentialData as any, // Assert type to bypass strict check
                outputDescriptor: outputDescriptor,
              },
            ],
            issuer: issuerDisplay,
          });
        },
      },
      verifier: {
        presentationDefinition: async (invitationId: string) => {
          // Keep existing verifier logic as it seems unrelated to the issuance data
          return {
            inputDescriptors: [
              {
                id: 'http://example.edu/credentials/58473',
                name: 'AlumniCredential',
                purpose: 'We need to verify your alumni status',
                constraints: {
                  fields: [
                    {
                      path: ['$.credentialSubject.givenName'],
                      filter: {
                        type: 'string',
                      },
                    },
                    {
                      path: ['$.credentialSubject.familyName'],
                      filter: {
                        type: 'string',
                      },
                    },
                  ],
                },
              },
            ],
          };
        },
      },
    });
  },
  inject: [CONFIG, WaciCredentialDataService], // Inject the new service
};
