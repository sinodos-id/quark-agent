import { Provider } from '@nestjs/common';
import { WACIProtocol, WACICredentialOfferSucceded } from '@extrimian/agent';
import { FileSystemStorage } from '../storage/filesystem-storage';
import { Configuration, CONFIG } from '../config';

export const WACIProtocolProvider: Provider = {
  provide: WACIProtocol,
  useFactory: (config: Configuration) => {
    return new WACIProtocol({
      storage: new FileSystemStorage({
        filepath: './storage/waci-storage.json',
      }),
      issuer: {
        issueCredentials: async (
          waciInvitationId: string,
          holderId: string,
        ) => {
          return new WACICredentialOfferSucceded({
            credentials: [
              {
                credential: {
                  '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://w3id.org/security/bbs/v1'
                  ],
                  id: `urn:uuid:${generateUUID()}`,
                  type: ['VerifiableCredential'],
                  name: 'Alumni',
                  issuer: {
                    id: 'did:quarkid:EiA9TCMjKqcM8FRHypJpKbaotnrcX-BvsoA_Ba4sPowstw',
                    name: 'National University'
                  },
                  issuanceDate: new Date(),
                  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  credentialSubject: {
                    id: holderId,
                    givenName: 'John',
                    familyName: 'Doe',
                  },
                },
                outputDescriptor: {
                  id: 'alumni_credential_output',
                  display: {
                    title: {
                      text: 'Alumni Credential'
                    },
                    subtitle: {
                      text: 'National University'
                    },
                    description: {
                      text: 'Credential that allows validating that they are a student of the institution',
                    },
                    properties: [
                      {
                        path: ['$.credentialSubject.givenName'],
                        fallback: 'Unknown',
                        label: 'Given Name',
                        schema: {
                          type: 'string'
                        }
                      },
                      {
                        path: ['$.credentialSubject.familyName'],
                        fallback: 'Unknown',
                        label: 'Family Name',
                        schema: {
                          type: 'string'
                        }
                      }
                    ],
                  },
                  styles: {
                    background: {
                      color: '#ff0000',
                    },
                    thumbnail: {
                      uri: 'https://dol.wa.com/logo.png',
                      alt: 'National University',
                    },
                    hero: {
                      uri: 'https://dol.wa.com/alumnos.png',
                      alt: 'University students',
                    },
                    text: {
                      color: '#d4d400',
                    },
                  },
                },
              },
            ],
            issuer: {
              name: 'National University',
              styles: {
                thumbnail: {
                  uri: 'https://dol.wa.com/logo.png',
                  alt: 'National University',
                },
                hero: {
                  uri: 'https://dol.wa.com/alumnos.png',
                  alt: 'University students',
                },
                background: {
                  color: '#ff0000',
                },
                text: {
                  color: '#d4d400',
                },
              },
            },
          });
        },
      },
      verifier: {
        presentationDefinition: async (invitationId: string) => {
          return {
            frame: {
              '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://w3id.org/security/bbs/v1'
              ],
              type: ['VerifiableCredential'],
              credentialSubject: {
                '@explicit': true,
                type: ['AlumniCredential'],
                givenName: {},
                familyName: {},
              },
            },
            inputDescriptors: [
              {
                id: 'alumni_credential',
                name: 'Alumni',
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
  inject: [CONFIG],
};

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}