import { Body, Controller, Post } from '@nestjs/common';
import { Logger } from '../utils/logger';

@Controller('verifier/webhook')
export class PresentationWebhookController {
  @Post()
  handleWebhook(@Body() body: any) {
    Logger.log('Received webhook', body);
    // We will add the SSE logic here later
  }
}