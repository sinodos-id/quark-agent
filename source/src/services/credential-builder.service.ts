import { Injectable } from '@nestjs/common';
import { WACICredentialOfferSucceded } from '@extrimian/agent';
import { Logger } from '../utils/logger';

export interface CredentialDisplayOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  type: string[];
  expirationDays?: number;
}

export interface CredentialStyles {
  background?: { color?: string };
  thumbnail?: { uri?: string; alt?: string };
  hero?: { uri?: string; alt?: string };
  text?: { color?: string };
}

export interface IssuerInfo {
  id: string;
  name: string;
  styles?: CredentialStyles;
}

@Injectable()
export class CredentialBuilderService {
  buildCredentialData(
    invitationId: string,
    holderId: string,
    issuer: IssuerInfo,
    credentialSubject: Record<string, unknown>,
    options: CredentialDisplayOptions,
    styles?: CredentialStyles,
  ) {
    Logger.debug('Building credential data', {
      invitationId,
      holderId,
      types: options.type,
    });

    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + (options.expirationDays || 7),
    );

    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/bbs/v1',
        { '@vocab': 'https://www.w3.org/ns/credentials/examples#' },
      ],
      name: options.title,
      id: `urn:uuid:${invitationId}`,
      type: ['VerifiableCredential', ...(options.type || [])],
      issuer: {
        id: issuer.id,
        name: issuer.name,
      },
      issuanceDate: new Date(),
      expirationDate,
      credentialSubject: {
        id: holderId,
        ...credentialSubject,
      },
    };
  }

  buildOutputDescriptor(
    options: CredentialDisplayOptions,
    credentialSubject: Record<string, unknown>,
    styles?: CredentialStyles,
  ) {
    return {
      id: `${options.type?.[0] || 'credential'}-output`,
      display: {
        title: {
          text: options.title ?? 'AutoPen Credential',
        },
        subtitle: {
          text: options.subtitle ?? 'Verified Credential',
        },
        description: {
          text: options.description ?? 'Verifiable Credential',
        },
        properties: this.buildProperties(credentialSubject),
      },
      styles: this.buildStyles(styles),
    };
  }

  buildIssuerDisplay(title: string, styles?: CredentialStyles) {
    return {
      name: title || 'Credential Issuer',
      styles: {
        thumbnail: {
          uri: styles?.thumbnail?.uri ?? 'https://dol.wa.com/logo.png',
          alt: styles?.thumbnail?.alt ?? 'National University',
        },
        hero: {
          uri: styles?.hero?.uri ?? 'https://dol.wa.com/alumnos.png',
          alt: styles?.hero?.alt ?? 'University students',
        },
        background: {
          color: styles?.background?.color ?? '#ff0000',
        },
        text: {
          color: styles?.text?.color ?? '#d4d400',
        },
      },
    };
  }

  private buildProperties(credentialSubject: Record<string, unknown>) {
    return Object.entries(credentialSubject).map(([key, value]) => ({
      path: [`$.credentialSubject.${key}`],
      fallback: 'Unknown',
      label: this.formatLabel(key),
      schema: {
        type: typeof value,
      },
    }));
  }

  private buildStyles(styles?: CredentialStyles) {
    return {
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
    };
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  }

  createCredentialOffer(
    invitationId: string,
    holderId: string,
    issuer: IssuerInfo,
    credentialSubject: Record<string, unknown>,
    options: CredentialDisplayOptions,
    styles?: CredentialStyles,
  ): WACICredentialOfferSucceded {
    const credentialData = this.buildCredentialData(
      invitationId,
      holderId,
      issuer,
      credentialSubject,
      options,
      styles,
    );

    const outputDescriptor = this.buildOutputDescriptor(
      options,
      credentialSubject,
      styles,
    );

    const issuerDisplay = this.buildIssuerDisplay(options.title, styles);

    return new WACICredentialOfferSucceded({
      options: {
        challenge: 'someChallenge123',
        domain: 'example.com',
      },
      credentials: [
        {
          credential: credentialData as any,
          outputDescriptor,
        },
      ],
      issuer: issuerDisplay,
    });
  }
}
