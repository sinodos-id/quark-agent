import { Agent, CredentialFlow, DID, InputDescriptor } from '@extrimian/agent';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTokenAuthGuard } from '../auth/guard/apitoken-auth.guard';
import { Logger } from '../utils/logger';
import { VerifiableCredentialWithInfo } from '@extrimian/agent/dist/vc/protocols/waci-protocol';
import { StoredCredentialData } from '../services/waci-issue-credential-data-mongo.service';
import { InvitationProcessingService } from '../services/invitation-processing.service';

enum OobGoalCode {
  LOGIN = 'extrimian/did-authentication/signin',
  SIGNUP = 'extrimian/did-authentication/signup',
}

enum GoalCode {
  Issuance = 'streamlined-vc',
  Presentation = 'streamlined-vp',
}

@Controller()
export class AppController {
  constructor(
    private agent: Agent,
    private invitationProcessingService: InvitationProcessingService,
  ) {}

  @Post('message')
  @UseGuards(ApiTokenAuthGuard)
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

    const processedInvitation =
      await this.invitationProcessingService.createAndProcessInvitation(
        flow,
        credentialData,
        presentationData,
      );

    Logger.log('🎉 API: Invitation created successfully', {
      invitationId: processedInvitation.invitationId,
      goalCode,
      presentationData,
    });

    return processedInvitation;
  }

  @Get('issued-vcs')
  @UseGuards(ApiTokenAuthGuard)
  async getIssuedVcs(): Promise<VerifiableCredentialWithInfo[]> {
    return this.agent.vc.getVerifiableCredentialsWithInfo();
  }

  @Post('send-invitation')
  @UseGuards(ApiTokenAuthGuard)
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
