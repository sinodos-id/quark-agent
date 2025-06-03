import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Agent, WebsocketServerTransport } from '@extrimian/agent';
import { Logger } from '../utils/logger';
import { INJECTION_TOKENS } from '../constants/injection-tokens';

@WebSocketGateway({ cors: true })
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(INJECTION_TOKENS.WEBSOCKET_TRANSPORT)
    private transport: WebsocketServerTransport,
    private agent: Agent,
  ) {}
  async afterInit(server): Promise<void> {
    this.transport.initializeServer(server);
    await this.transport.initialize({ agent: this.agent });
    Logger.log('Websocket server initialized', this.constructor.name);
  }

  handleConnection(client: any): void {
    Logger.debug('Client connected', {
      clientId: client.id,
      gateway: this.constructor.name,
    });

    client.onAny((event, ...args) => {
      Logger.debug('Socket event received', {
        event,
        data: args,
        clientId: client.id,
        gateway: this.constructor.name,
      });
    });
  }

  handleDisconnect(client: any): void {
    Logger.debug('Client disconnected', {
      clientId: client.id,
      gateway: this.constructor.name,
    });
  }
}
