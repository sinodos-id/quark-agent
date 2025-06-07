import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG, Configuration } from '../../config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
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
