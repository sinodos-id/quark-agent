import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG, Configuration, ConfigProvider } from '../../config';
import { StorageSchema } from '../schemas/storage.schema';
import {
  MongoAgentStorage,
  MongoVCStorage,
  MongoSecureStorage,
} from './mongo-storage';
import { INJECTION_TOKENS } from '../../constants/injection-tokens';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: Configuration) => ({
        uri: config.MONGO_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [CONFIG],
    }),
    MongooseModule.forFeature([
      { name: 'agent_storage', schema: StorageSchema },
      { name: 'vc_storage', schema: StorageSchema },
      { name: 'secure_storage', schema: StorageSchema },
    ]),
  ],
  providers: [
    ConfigProvider,
    MongoAgentStorage,
    MongoVCStorage,
    {
      provide: INJECTION_TOKENS.AGENT_SECURE_STORAGE,
      useClass: MongoSecureStorage,
    },
  ],
  exports: [
    MongooseModule,
    MongoAgentStorage,
    MongoVCStorage,
    INJECTION_TOKENS.AGENT_SECURE_STORAGE,
  ],
})
export class MongoStorageModule {}
