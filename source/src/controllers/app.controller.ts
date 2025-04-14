import { Agent, CredentialFlow, DID } from '@extrimian/agent';
import { GoalCode } from '@extrimian/waci';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import { decode } from 'base-64';
import { CONFIG, Configuration } from '../config';
import { VerifiableCredentialWithInfo } from '@extrimian/agent/dist/vc/protocols/waci-protocol';
// import { ApiTokenAuthGuard } from 'src/auth/guard/apitoken-auth.guard';

enum OobGoalCode {
  LOGIN = 'extrimian/did-authentication/signin',
  SIGNUP = 'extrimian/did-authentication/signup',
}

// @UseGuards(ApiTokenAuthGuard)
@Controller()
export class AppController {
  constructor(
    private agent: Agent,
    @Inject(CONFIG) private config: Configuration,
  ) {}

  // Refactor
  @Post('message')
  async createInvitation(@Body('goalCode') goalCode: GoalCode | OobGoalCode) {
    let flow: CredentialFlow;
    switch (goalCode) {
      case GoalCode.Issuance:
        flow = CredentialFlow.Issuance;
        break;
      case GoalCode.Presentation:
        flow = CredentialFlow.Presentation;
        break;

      default:
        throw new BadRequestException('Unsupported goal code');
    }
    const invitation = await this.agent.vc.createInvitationMessage({ flow });
    const invitationSplit = invitation.split('?_oob=')[1];
    const invitationDecoded = JSON.parse(decode(invitationSplit));
    return invitationDecoded;
  }

  @Get('issued-vcs')
  async getIssuedVcs(): Promise<VerifiableCredentialWithInfo[]> {
    return this.agent.vc.getVerifiableCredentialsWithInfo();
  }

  @Post('send-invitation')
  sendInvitation(@Body() body: any): void {
    this.agent.messaging.sendMessage({
      to: DID.from(body.to),
      message: body.message,
    });
  }
}
