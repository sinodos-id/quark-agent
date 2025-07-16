import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { InvitationProcessingService } from '../services/invitation-processing.service';
import { CredentialFlow, InputDescriptor } from '@extrimian/agent';
import * as qrcode from 'qrcode';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, Configuration } from '../config';

class VerifyRequestDto {
  presentationData: string;
}

@Controller('verifier')
export class VerifierController {
  constructor(
    private invitationProcessingService: InvitationProcessingService,
    @Inject(CONFIG) private config: Configuration,
  ) {}

  @Post('qr-code')
  async getQrCode(@Body() body: VerifyRequestDto, @Res() response: Response) {
    console.log(body.presentationData);

    const sessionId = uuidv4();
    const webhookUrl = `${this.config.APP_URL}/verifier/webhook/${sessionId}`;

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

    response.setHeader('Content-Type', 'text/html');
    response.send(`<img src="${qrCodeDataUrl}" />`);
  }
}