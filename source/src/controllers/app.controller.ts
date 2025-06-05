import { Agent, CredentialFlow, DID } from '@extrimian/agent';
import { GoalCode, InputDescriptor } from '@extrimian/waci';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '../utils/logger';
import { CONFIG, Configuration } from '../config';
import { VerifiableCredentialWithInfo } from '@extrimian/agent/dist/vc/protocols/waci-protocol';
import {
  WaciCredentialDataService,
  StoredCredentialData,
} from '../services/waci-credential-data.service';
import { WaciPresentationMongoService } from '../services/waci-presentation-mongo.service';

enum OobGoalCode {
  LOGIN = 'extrimian/did-authentication/signin',
  SIGNUP = 'extrimian/did-authentication/signup',
}

@Controller()
export class AppController {
  constructor(
    private agent: Agent,
    @Inject(CONFIG) private config: Configuration,
    private waciCredentialDataService: WaciCredentialDataService,
    private waciPresentationService: WaciPresentationMongoService,
  ) {}

  @Post('message')
  async createInvitation(
    @Body('goalCode') goalCode: GoalCode | OobGoalCode,
    @Body('credentialData') credentialData?: StoredCredentialData,
    @Body('presentationData') presentationData?: InputDescriptor[],
  ) {
    Logger.log('🚀 API: Received invitation creation request', { goalCode });

    let flow: CredentialFlow;
    switch (goalCode) {
      case GoalCode.Issuance:
        flow = CredentialFlow.Issuance;
        break;
      case GoalCode.Presentation:
        flow = CredentialFlow.Presentation;
        break;

      default:
        Logger.error('❌ Unsupported goal code', null, { goalCode });
        throw new BadRequestException('Unsupported goal code');
    }

    const invitation = await this.agent.vc.createInvitationMessage({ flow });
    const invitationSplit = invitation.split('?_oob=')[1];

    if (!invitationSplit) {
      Logger.error(
        '❌ Invalid invitation format: missing _oob parameter',
        null,
        {
          invitation: invitation.substring(0, 100) + '...',
        },
      );
      throw new InternalServerErrorException('Invalid invitation format');
    }

    let invitationDecoded: any = {};

    try {
      const decodedString = Buffer.from(invitationSplit, 'base64').toString(
        'utf-8',
      );
      invitationDecoded = JSON.parse(decodedString);

      // Store credential data if provided for issuance flow
      if (
        flow === CredentialFlow.Issuance &&
        credentialData &&
        invitationDecoded.id
      ) {
        this.waciCredentialDataService.storeData(
          invitationDecoded.id,
          credentialData,
        );
      }

      // Store presentation data if provided for presentation flow
      if (
        flow === CredentialFlow.Presentation &&
        presentationData &&
        invitationDecoded.id
      ) {
        await this.waciPresentationService.storeData(
          invitationDecoded.id,
          presentationData,
        );
      }
    } catch (error) {
      Logger.error('❌ Failed to process invitation', error, {
        goalCode,
        flow,
        hasCredentialData: !!credentialData,
        hasPresentationData: !!presentationData,
        base64Sample: invitationSplit?.substring(0, 50) + '...',
      });
      throw new InternalServerErrorException('Failed to process invitation');
    }

    Logger.log('🎉 API: Invitation created successfully', {
      invitationId: invitationDecoded.id,
      goalCode,
      presentationData,
    });

    return { ...invitationDecoded, invitationId: invitationDecoded.id };
  }

  @Get('issued-vcs')
  async getIssuedVcs(): Promise<VerifiableCredentialWithInfo[]> {
    return this.agent.vc.getVerifiableCredentialsWithInfo();
  }

  @Post('send-invitation')
  sendInvitation(@Body() body: any): void {
    Logger.debug('Sending invitation message', {
      to: body.to,
      messageLength: body.message?.length,
    });

    this.agent.messaging.sendMessage({
      to: DID.from(body.to),
      message: body.message,
    });
  }
}
