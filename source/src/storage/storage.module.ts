import { Module } from '@nestjs/common';
import { CONFIG, Configuration } from '../config';
import { INJECTION_TOKENS } from '../constants/injection-tokens';
import { MongoStorage } from './mongo-storage';
import { JsonFileStorage } from './json-file-storage';
import { JsonVcStorage } from './json-vc-storage';
import { ConfigModule } from '../config/config.module';
import { IssuedCredentialMongoStorage } from './waci-issue-credential-data-mongo.storage';
import { CredentialPresentationMongoStorage } from './waci-presentation-mongo.storage';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WaciIssueCredentialData,
  WaciIssueCredentialDataSchema,
} from '../schemas/waci-issue-credential-data.schema';
import {
  WaciPresentation,
  WaciPresentationSchema,
} from '../schemas/waci-presentation.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: WaciIssueCredentialData.name,
        schema: WaciIssueCredentialDataSchema,
      },
      {
        name: WaciPresentation.name,
        schema: WaciPresentationSchema,
      },
    ]),
  ],
  providers: [
    IssuedCredentialMongoStorage,
    CredentialPresentationMongoStorage,
    {
      provide: INJECTION_TOKENS.AGENT_SECURE_STORAGE,
      useFactory: (config: Configuration) => {
        if (config.NODE_ENV === 'development') {
          return new JsonFileStorage('./storage/secure.json');
        }
        return new MongoStorage('secure_storage');
      },
      inject: [CONFIG],
    },
    {
      provide: INJECTION_TOKENS.AGENT_STORAGE,
      useFactory: (config: Configuration) => {
        if (config.NODE_ENV === 'development') {
          return new JsonFileStorage('./storage/agent.json');
        }
        return new MongoStorage('agent_storage');
      },
      inject: [CONFIG],
    },
    {
      provide: INJECTION_TOKENS.VC_STORAGE,
      useFactory: (config: Configuration) => {
        if (config.NODE_ENV === 'development') {
          return new JsonVcStorage('./storage/vc.json');
        }
        return new MongoStorage('vc_storage');
      },
      inject: [CONFIG],
    },
    {
      provide: INJECTION_TOKENS.WACI_PROTOCOL_STORAGE,
      useFactory: (config: Configuration) => {
        if (config.NODE_ENV === 'development') {
          return new JsonFileStorage('./storage/waci_protocol.json');
        }
        return new MongoStorage('waci_protocol_storage');
      },
      inject: [CONFIG],
    },
  ],
  exports: [
    MongooseModule,
    IssuedCredentialMongoStorage,
    CredentialPresentationMongoStorage,
    INJECTION_TOKENS.AGENT_SECURE_STORAGE,
    INJECTION_TOKENS.AGENT_STORAGE,
    INJECTION_TOKENS.VC_STORAGE,
    INJECTION_TOKENS.WACI_PROTOCOL_STORAGE,
  ],
})
export class StorageModule {}
