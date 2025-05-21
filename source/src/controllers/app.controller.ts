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
import { CONFIG, Configuration } from '../config';
import { VerifiableCredentialWithInfo } from '@extrimian/agent/dist/vc/protocols/waci-protocol';
import { WaciCredentialDataService, StoredCredentialData } from '../services/waci-credential-data.service';
import { WaciPresentationDataService } from '../services/waci-presentation-data.service';
import { InputDescriptor } from '@extrimian/agent/node_modules/@extrimian/waci/dist/types/credential-manifest'; // Import InputDescriptor from the library

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
    private waciPresentationDataService: WaciPresentationDataService, // Inject the new service
  ) {}

  @Post('message')
  async createInvitation(
    @Body('goalCode') goalCode: GoalCode | OobGoalCode,
    @Body('credentialData') credentialData?: StoredCredentialData,
    @Body('presentationData') presentationData?: InputDescriptor[],
  ) {
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

    let invitationDecoded: any = {}; 

    try {
      const decodedString = Buffer.from(invitationSplit, 'base64').toString(
        'utf-8',
      );
      invitationDecoded = JSON.parse(decodedString);

      // Store credential data if provided for issuance flow
      if (flow === CredentialFlow.Issuance && credentialData && invitationDecoded.id) {
        this.waciCredentialDataService.storeData(invitationDecoded.id, credentialData);
      }

      // Store presentation data if provided for presentation flow
      if (flow === CredentialFlow.Presentation && presentationData && invitationDecoded.id) {
        this.waciPresentationDataService.storeData(invitationDecoded.id, presentationData);
      }

    } catch (error) {
      console.error('Error decoding invitation or storing data:', error); // Updated error message
      // Optional: Set default values or re-throw error
    }

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
