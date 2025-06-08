import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG, Configuration } from '../../config';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CONFIG],
      useFactory: (config: Configuration) => {
        return {
          uri: config.MONGO_URI,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoConfigModule {}
