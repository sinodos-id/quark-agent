import {
  WaciCredentialDataService,
  StoredCredentialData,
} from './waci-credential-data.service';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { Agent, CredentialFlow } from '@extrimian/agent';
import { Logger } from '../utils/logger';

@Injectable()
export class IssuanceService {
  constructor(
    private agent: Agent,
    private waciCredentialDataService: WaciCredentialDataService,
  ) {}

  async initiateDynamicIssuance(
    data: StoredCredentialData, // Accept the combined data object
  ): Promise<{
    invitationId: string;
    oobContentData: string;
    credentialData: any;
  }> {
    Logger.log('🚀 Starting dynamic credential issuance process', {
      issuerDid: data.issuerDid,
      credentialTypes: data.options.type,
    });

    const { issuerDid, nameDid, credentialSubject, options, styles, issuer } =
      data;

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + (options.expirationDays || 7),
    );

    // Build the credential data object (similar to the provided issueCredential method)
    const vcId = uuidv4();
    const subjectId = uuidv4();

    const credentialData = {
      did: issuerDid, // This seems redundant in the VC object itself, but keeping for structure
      oneTimeUse: options.oneTimeUse, // This is an option for the flow, not the VC
      vc: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/bbs/v1',
          { '@vocab': 'https://www.w3.org/ns/credentials/examples#' },
        ],
        name: options.displayTitle,
        id: `urn:uuid:${vcId}`, // Generate a new UUID for the VC ID
        type: ['VerifiableCredential', ...(options.type || [])],
        issuer: {
          id: issuerDid,
          name: nameDid ?? 'Credential Issuer',
        },
        issuanceDate: new Date().toISOString(),
        expirationDate: expirationDate.toISOString(),
        credentialSubject: {
          id: subjectId, // Generate a new UUID for the credentialSubject ID
          ...credentialSubject,
        },
      },
      outputDescriptor: {
        id: `${options.type?.[0] || 'credential'}-output`,
        display: {
          title: {
            text: options.displayTitle ?? 'AutoPen Credential',
          },
          subtitle: {
            text: options.displaySubtitle ?? 'Verified Credential',
          },
          description: {
            text: options.displayDescription ?? 'Verifiable Credential',
          },
          properties: Object.entries(credentialSubject).map(([key, value]) => ({
            path: [`$.credentialSubject.${key}`],
            fallback: 'Unknown',
            label: key
              .replace(/([A-Z])/g, ' $1')
              .trim()
              .replace(/^./, (str) => str.toUpperCase()), // Simple formatting
            schema: {
              type: typeof value,
            },
          })),
        },
        styles: {
          background: {
            color: styles?.background?.color ?? '#0f172a',
          },
          thumbnail: {
            uri: styles?.thumbnail?.uri ?? 'https://i.imgur.com/DxQW7sh.png',
            alt: styles?.thumbnail?.alt ?? 'Icon VC',
          },
          hero: {
            uri:
              styles?.hero?.uri ??
              'https://img.freepik.com/free-vector/modern-circular-halftone-dots-pattern-background_1035-23801.jpg',
            alt: styles?.hero?.alt ?? 'Background VC',
          },
          text: {
            color: styles?.text?.color ?? '#000000',
          },
        },
      },
      issuer: {
        name: options.displayTitle || 'Credential Issuer',
        styles: issuer?.styles, // Use provided issuer styles
      },
      display: {
        // This display seems redundant with outputDescriptor.display, but keeping for structure
        title: {
          text: options.displayTitle ?? 'AutoPen Credential',
        },
        subtitle: {
          text: options.displaySubtitle ?? 'Verified Credential',
        },
        description: {
          text: options.displayDescription ?? 'Verifiable Credential',
        },
      },
    };

    // Initiate the local WACI issuance flow
    Logger.log('📨 Creating WACI invitation message', {
      flow: 'Issuance',
      credentialTypes: options.type,
    });

    const invitation = await this.agent.vc.createInvitationMessage({
      flow: CredentialFlow.Issuance,
    });

    const invitationSplit = invitation.split('?_oob=')[1];

    if (!invitationSplit) {
      const errorMessage = 'Invalid invitation format: missing _oob parameter';
      Logger.error(errorMessage, null, { invitation });
      throw new Error(errorMessage);
    }

    let invitationDecoded: any = {};
    try {
      const decodedString = Buffer.from(invitationSplit, 'base64').toString(
        'utf-8',
      );
      invitationDecoded = JSON.parse(decodedString);
    } catch (error) {
      Logger.error('❌ Failed to decode invitation', error, {
        base64Data: invitationSplit.substring(0, 100) + '...',
      });
      throw new Error('Failed to decode invitation');
    }

    const invitationId = invitationDecoded.id;

    // Store the credential data using the invitation ID
    if (invitationId) {
      Logger.log('💾 Storing credential data for invitation', {
        invitationId,
        credentialTypes: data.options.type,
      });

      this.waciCredentialDataService.storeData(invitationId, data); // Store the original data structure
    } else {
      const errorMessage = 'Invitation ID not found in decoded invitation';
      Logger.error(errorMessage, null, {
        decodedInvitation: invitationDecoded,
      });
      throw new Error(errorMessage);
    }

    Logger.log('🎉 Dynamic credential issuance initiated successfully', {
      invitationId: invitationId,
      types: data.options.type,
    });

    // Return the OOB URL and the constructed credential data
    return {
      invitationId: invitationId, // Include invitationId in the return
      oobContentData: invitationSplit, // Return the base64 part as OOB content
      credentialData: credentialData, // Return the constructed credential data
    };
  }

  // Helper function for formatting labels (if needed, based on your original code)
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  }
}
