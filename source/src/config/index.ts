import { ValueProvider } from '@nestjs/common';
//import * as enviroment from '../enviroment/config.json';
import * as fs from 'fs';
import * as path from 'path'

export const mappingConfig = ()=>{
  const configPath = path.join(__dirname, '..' , '..', 'enviroments', 'config.json');
  const configData = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);
  return config
}

const enviroment = mappingConfig();



const config = {
  PORT: Number(enviroment.PORT) || 3000,
  WEBSOCKET_ENDPOINT_ID:
    enviroment.WEBSOCKET_ENDPOINT_ID || 'MessagingWebSocket',
  DID_METHOD: enviroment.DID_METHOD,
  WEBSOCKET_ENDPOINT_URL: enviroment.WEBSOCKET_ENDPOINT_URL,
  SSI_INTEGRATION_API_URL: enviroment.SSI_INTEGRATION_API_URL,
  MONGO_URI: enviroment.MONGO_URI,
  MODENA_URL: enviroment.MODENA_URL,
  VAULT_URL: enviroment.VAULT_URL,
  VAULT_ROLE_ID: enviroment.VAULT_ROLE_ID,
  VAULT_SECRET_ID: enviroment.VAULT_SECRET_ID,
  DWN_URL: enviroment.DWN_URL,
  TOKEN_SECRET : enviroment.TOKEN_SECRET,
};

export const CONFIG = Symbol.for('CONFIG');
export type Configuration = typeof config;
export const ConfigProvider: ValueProvider<Configuration> = {
  provide: CONFIG,
  useValue: config,
};
