import { Body, Controller, Param, Put } from '@nestjs/common';
import { Logger } from '../utils/logger';
import { SseService } from './sse.service';

@Controller('verifier/webhook')
export class PresentationWebhookController {
  constructor(private sseService: SseService) {}

  @Put(':sessionId')
  handleWebhook(@Param('sessionId') sessionId: string, @Body() body: any) {
    Logger.log(`Received webhook for session ${sessionId}`, body);
    this.sseService.emit(sessionId, body);
  }
}