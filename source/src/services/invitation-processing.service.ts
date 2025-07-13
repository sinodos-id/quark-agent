import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Agent, CredentialFlow, InputDescriptor } from '@extrimian/agent';
import { Logger } from '../utils/logger';
import {
  StoredCredentialData,
  IssuedCredentialMongoStorage,
} from '../storage/waci-issue-credential-data-mongo.storage';
import { CredentialPresentationMongoStorage } from '../storage/waci-presentation-mongo.storage';

export interface ProcessedInvitation {
  invitationId: string;
  [key: string]: any;
}

@Injectable()
export class InvitationProcessingService {
  constructor(
    private agent: Agent,
    private waciIssueCredentialDataService: IssuedCredentialMongoStorage,
    private waciPresentationService: CredentialPresentationMongoStorage,
  ) {}

  async createAndProcessInvitation(
    flow: CredentialFlow,
    credentialData?: StoredCredentialData,
    presentationData?: InputDescriptor[],
  ): Promise<ProcessedInvitation> {
    Logger.log('🔄 Service: Creating invitation', { flow });

    const invitation = await this.agent.vc.createInvitationMessage({ flow });
    const processedInvitation = await this.processInvitation(
      invitation,
      flow,
      credentialData,
      presentationData,
    );

    Logger.log('✅ Service: Invitation processed successfully', {
      invitationId: processedInvitation.invitationId,
      flow,
    });

    return processedInvitation;
  }

  private async processInvitation(
    invitation: string,
    flow: CredentialFlow,
    credentialData?: StoredCredentialData,
    presentationData?: InputDescriptor[],
  ): Promise<ProcessedInvitation> {
    const invitationDecoded = this.decodeInvitation(invitation);

    if (!invitationDecoded.id) {
      Logger.error('❌ Invitation missing ID', null, { invitationDecoded });
      throw new InternalServerErrorException('Invalid invitation: missing ID');
    }

    await this.storeAssociatedData(
      invitationDecoded.id,
      flow,
      credentialData,
      presentationData,
    );

    return {
      ...invitationDecoded,
      invitationId: invitationDecoded.id,
    };
  }

  private decodeInvitation(invitation: string): any {
    const invitationSplit = invitation.split('?_oob=')[1];

    if (!invitationSplit) {
      Logger.error(
        '❌ Invalid invitation format: missing _oob parameter',
        null,
        { invitation: invitation.substring(0, 100) + '...' },
      );
      throw new InternalServerErrorException('Invalid invitation format');
    }

    try {
      const decodedString = Buffer.from(invitationSplit, 'base64').toString(
        'utf-8',
      );
      return JSON.parse(decodedString);
    } catch (error) {
      Logger.error('❌ Failed to decode invitation', error, {
        base64Sample: invitationSplit?.substring(0, 50) + '...',
      });
      throw new InternalServerErrorException('Failed to decode invitation');
    }
  }

  private async storeAssociatedData(
    invitationId: string,
    flow: CredentialFlow,
    credentialData?: StoredCredentialData,
    presentationData?: InputDescriptor[],
  ): Promise<void> {
    try {
      if (flow === CredentialFlow.Issuance && credentialData) {
        await this.waciIssueCredentialDataService.storeData(
          invitationId,
          credentialData,
        );
        Logger.log('📦 Stored credential data', { invitationId });
      }

      if (flow === CredentialFlow.Presentation && presentationData) {
        await this.waciPresentationService.storeData(
          invitationId,
          presentationData,
        );
        Logger.log('📋 Stored presentation data', { invitationId });
      }
    } catch (error) {
      Logger.error('❌ Failed to store associated data', error, {
        invitationId,
        flow,
        hasCredentialData: !!credentialData,
        hasPresentationData: !!presentationData,
      });
      throw new InternalServerErrorException('Failed to store invitation data');
    }
  }
}
