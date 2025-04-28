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
                    'https://www.w3.org/2018/credentials/examples/v1',
                    'https://w3id.org/security/bbs/v1',
                  ],
                  id: 'http://example.edu/credentials/58474',
                  type: ['VerifiableCredential'],
                  issuer:
                    'did:quarkid:EiA9TCMjKqcM8FRHypJpKbaotnrcX-BvsoA_Ba4sPowstw',
                  issuanceDate: new Date(),
                  credentialSubject: {
                    id: holderId,
                    givenName: 'John',
                    familyName: 'Doe',
                  },
                },
                outputDescriptor: {
                  id: 'alumni_credential_output',
                  schema:
                    'https://schema.org/EducationalOccupationalCredential',
                  display: {
                    title: {
                      path: ['$.type[1]'],
                      fallback: 'Alumni Credential',
                    },
                    subtitle: {
                      path: ['$.issuer'],
                      fallback: 'National University',
                    },
                    description: {
                      text: 'Credential that allows validating that they are a student of the institution',
                    },
                    properties: [
                      {
                        label: 'Given Name',
                        path: ['$.credentialSubject.givenName'],
                      },
                      {
                        label: 'Family Name',
                        path: ['$.credentialSubject.familyName'],
                      },
                      {
                        label: 'Issuer',
                        path: ['$.issuer'],
                      },
                      {
                        label: 'Issuance Date',
                        path: ['$.issuanceDate'],
                      },
                      {
                        label: 'Credential Type',
                        path: ['$.type[1]'],
                      },
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
            // frame: {
            //   '@context': [
            //     'https://www.w3.org/2018/credentials/v1',
            //     'https://www.w3.org/2018/credentials/examples/v1',
            //     'https://w3id.org/security/bbs/v1',
            //   ],
            //   type: ['VerifiableCredential'],
            //   credentialSubject: {
            //     '@explicit': true,
            //     type: ['AlumniCredential'],
            //     givenName: {},
            //     familyName: {},
            //   },
            // },
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
  inject: [CONFIG],
};
