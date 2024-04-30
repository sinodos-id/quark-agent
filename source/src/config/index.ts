import { ValueProvider } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  PORT: Number(process.env.PORT) || 3000,
  WEBSOCKET_ENDPOINT_ID:
    process.env.WEBSOCKET_ENDPOINT_ID || 'MessagingWebSocket',
  DID_METHOD: process.env.DID_METHOD,
  WEBSOCKET_ENDPOINT_URL: process.env.WEBSOCKET_ENDPOINT_URL,
  SSI_INTEGRATION_API_URL: process.env.SSI_INTEGRATION_API_URL,
  SSI_INTEGRATION_TOKEN: process.env.SSI_INTEGRATION_TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  MODENA_URL: process.env.MODENA_URL,
  VAULT_URL: process.env.VAULT_URL,
  VAULT_ROLE_ID: process.env.VAULT_ROLE_ID,
  VAULT_SECRET_ID: process.env.VAULT_SECRET_ID,
  DWN_URL: process.env.DWN_URL,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
};

export const CONFIG = Symbol.for('CONFIG');
export type Configuration = typeof config;
export const ConfigProvider: ValueProvider<Configuration> = {
  provide: CONFIG,
  useValue: config,
};
