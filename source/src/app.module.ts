import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AppController } from './controllers/app.controller';
import { VerifiableCredentialService } from '@extrimian/vc-core';
import { MessagingGateway } from './controllers/messaging.gateway';
import { ConfigProvider, CONFIG, Configuration } from './config';
import {
  WebsocketServerTransport,
  WACIProtocol,
  WACICredentialOfferSucceded,
} from '@extrimian/agent';
import { FileSystemStorage } from './storage/filesystem-storage';
import { JsonStorage } from './storage/memory-storage';
import { AgentProvider } from './services/agent.provider';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HealthController, AppController],
  providers: [
    {
      provide: VerifiableCredentialService,
      useClass: VerifiableCredentialService,
    },
    {
      provide: WebsocketServerTransport,
      useClass: WebsocketServerTransport,
    },
    {
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
                      id: 'http://example.edu/credentials/58473',
                      type: ['VerifiableCredential', 'AlumniCredential'],
                      issuer: config.DID_METHOD,
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
                          path: ['$.name', '$.vc.name'],
                          fallback: 'Alumni Credential',
                        },
                        subtitle: {
                          path: ['$.class', '$.vc.class'],
                          fallback: 'Alumni',
                        },
                        description: {
                          text: 'Credential that allows validating that they are a student of the institution',
                        },
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
                options: {
                  challenge: '508adef4-b8e0-4edf-a53d-a260371c1423',
                  domain: '9rf25a28rs96',
                },
              });
            },
          },
        });
      },
      inject: [CONFIG],
    },
    ConfigProvider,
    {
      provide: 'AGENT_SECURE_STORAGE',
      useClass: JsonStorage,
    },
    AgentProvider,
    MessagingGateway,
  ],
})
export class AppModule {}
