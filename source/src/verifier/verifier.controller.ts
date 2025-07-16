import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Res,
  Sse,
} from '@nestjs/common';
import { InvitationProcessingService } from '../services/invitation-processing.service';
import { CredentialFlow } from '@extrimian/agent';
import * as qrcode from 'qrcode';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, Configuration } from '../config';
import { SseService } from './sse.service';
import { Observable, fromEvent, map } from 'rxjs';

class VerifyRequestDto {
  presentationData: string;
}

@Controller('verifier')
export class VerifierController {
  constructor(
    private invitationProcessingService: InvitationProcessingService,
    @Inject(CONFIG) private config: Configuration,
    private sseService: SseService,
  ) {}

  @Sse('events/:sessionId')
  sse(@Param('sessionId') sessionId: string): Observable<any> {
    console.log(`Client connected to SSE for session: ${sessionId}`);
    return fromEvent(this.sseService['emitter'], sessionId).pipe(
      map((data) => ({ data })),
    );
  }

  @Post('qr-code')
  async getQrCode(@Body() body: VerifyRequestDto, @Res() response: Response) {
    console.log(body.presentationData);

    const sessionId = uuidv4();
    const webhookUrl = `${this.config.APP_URL}/verifier/webhook/${sessionId}`;

    console.log(`Generated webhook URL: ${webhookUrl}`);

    const presentationData = JSON.parse(body.presentationData);
    console.log(presentationData);

    // Manually construct the object to avoid parsing issues.
    presentationData.webhookUrl = webhookUrl;

    const invitation =
      await this.invitationProcessingService.createAndProcessInvitation(
        CredentialFlow.Presentation,
        null,
        [presentationData], // Wrap the single object in an array
      );

    const qrCodeDataUrl = await qrcode.toDataURL(invitation.invitationUrl);

    const htmlResponse = `
      <div hx-ext="sse" sse-connect="/verifier/events/${sessionId}" sse-swap="message">
        <img src="${qrCodeDataUrl}" />
        <div id="sse-message-container"></div>
      </div>
    `;

    response.setHeader('Content-Type', 'text/html');
    response.send(htmlResponse);
  }
}