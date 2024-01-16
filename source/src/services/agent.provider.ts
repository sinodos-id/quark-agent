import {
  Agent,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  DWNTransport,
  WACIProtocol,
  WebsocketServerTransport,
} from '@extrimian/agent';
import { FactoryProvider } from '@nestjs/common';
import { CONFIG, Configuration } from '../config';
import { FileSystemAgentSecureStorage } from '../storage/filesystem-secure-storage';
import { FileSystemStorage } from '../storage/filesystem-storage';
import { VaultStorage } from 'src/storage/vault-storage';

export const AgentProvider: FactoryProvider<Agent> = {
  provide: Agent,
  inject: [VaultStorage, WACIProtocol, WebsocketServerTransport, CONFIG],
  useFactory: async (
    vaultStorage: VaultStorage,
    waciProtocol: WACIProtocol,
    transport: WebsocketServerTransport,
    config: Configuration,
  ) => {
    const agent = new Agent({
      didDocumentRegistry: new AgentModenaUniversalRegistry(config.MODENA_URL),
      didDocumentResolver: new AgentModenaUniversalResolver(config.MODENA_URL),
      vcProtocols: [waciProtocol],
      supportedTransports: [new DWNTransport()],
      agentStorage: new FileSystemStorage({ filepath: './storage/agent-storage.json' }),
      vcStorage: new FileSystemStorage({ filepath: './vc-storage.json' }),
      secureStorage: vaultStorage,
    });
    await agent.initialize();
    const dids = agent.identity.getDIDs();
    if (!dids.length) {
      await agent.identity.createNewDID({
        didMethod: config.DID_METHOD,
        dwnUrl: config.DWN_URL,
        services: config.WEBSOCKET_ENDPOINT_URL
          ? [
              {
                id: 'websocket',
                type: config.WEBSOCKET_ENDPOINT_ID,
                serviceEndpoint: config.WEBSOCKET_ENDPOINT_URL,
              },
            ]
          : undefined,
      });
    }

    agent.vc.ackCompleted.on((param) => {
      console.log('ack completed', param);
    });

    agent.vc.credentialArrived.on(async (vcs) => {
      await Promise.all(
        vcs.credentials.map((vc) => {
          agent.vc.saveCredentialWithInfo(vc.data, {
            styles: vc.styles,
            display: vc.display,
          });
        }),
      );
    });
    return agent;
  },
};
