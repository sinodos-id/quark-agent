import * as dotenv from 'dotenv';
dotenv.config();
import { CONFIG, Configuration } from './config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Agent } from '@extrimian/agent';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<Configuration>(CONFIG);

  app.enableCors();

  await app.listen(config.PORT);
  Logger.log(`Running on port ${config.PORT}`);

  const agent = app.get(Agent);

  const did = agent.identity.getOperationalDID();
  Logger.log(`Operational DID: ${did.value}`);
}
bootstrap();
