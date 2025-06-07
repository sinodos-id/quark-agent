import { Module } from '@nestjs/common';
import { ConfigProvider, CONFIG } from './index';

@Module({
  providers: [ConfigProvider],
  exports: [ConfigProvider, CONFIG],
})
export class ConfigModule {}
