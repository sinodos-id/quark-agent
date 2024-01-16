import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Agent, WebsocketServerTransport } from '@extrimian/agent';

@WebSocketGateway({ cors: true })
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private transport: WebsocketServerTransport,
    private agent: Agent,
  ) {}
  async afterInit(server): Promise<void> {
    this.transport.initializeServer(server);
    await this.transport.initialize({ agent: this.agent });
    Logger.log('Websocket server initialized', this.constructor.name);
  }

  handleConnection(client: any): void {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any): void {
    Logger.log(`Client disconnected: ${client.id}`);
  }
}