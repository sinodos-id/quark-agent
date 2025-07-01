import { Injectable } from '@nestjs/common';
import { WACICredentialOfferSucceded } from '@extrimian/agent';
import { Logger } from '../utils/logger';

export interface CredentialDisplayOptions {
  displayTitle?: string;
  displaySubtitle?: string;
  description?: string;
  type: string[];
  expirationDays?: number;
  expirationDate?: string;
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
  private ensureStringId(id: any, fieldName: string): string {
    if (typeof id === 'string') {
      return id;
    }

    Logger.warn(`Converting non-string ${fieldName} to string`, {
      originalValue: id,
      originalType: typeof id,
    });

    return String(id);
  }

  private sanitizeCredentialSubject(
    credentialSubject: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized = { ...credentialSubject };

    // Check for any nested @id or id fields that might not be strings
    Object.keys(sanitized).forEach((key) => {
      if (key === '@id' || key === 'id') {
        sanitized[key] = this.ensureStringId(
          sanitized[key],
          `credentialSubject.${key}`,
        );
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        // Recursively check nested objects
        const nestedObj = sanitized[key] as Record<string, unknown>;
        if (nestedObj['@id']) {
          nestedObj['@id'] = this.ensureStringId(
            nestedObj['@id'],
            `credentialSubject.${key}.@id`,
          );
        }
        if (nestedObj['id']) {
          nestedObj['id'] = this.ensureStringId(
            nestedObj['id'],
            `credentialSubject.${key}.id`,
          );
        }
      }
    });
    return sanitized;
  }

  private logCredentialDataForDebugging(
    invitationId: string,
    holderId: string,
    credentialSubject: Record<string, unknown>,
  ): void {
    Logger.debug('Building credential data', {
      invitationId: {
        value: invitationId,
        type: typeof invitationId,
      },
      holderId: {
        value: holderId,
        type: typeof holderId,
      },
      credentialSubject: {
        keys: Object.keys(credentialSubject),
        hasIdField: 'id' in credentialSubject,
        hasAtIdField: '@id' in credentialSubject,
        idFieldType: typeof credentialSubject.id,
        atIdFieldType: typeof credentialSubject['@id'],
      },
    });
  }

  buildCredentialData(
    invitationId: string,
    holderId: string,
    issuer: IssuerInfo,
    credentialSubject: Record<string, unknown>,
    options: CredentialDisplayOptions,
    styles?: CredentialStyles,
  ) {
    // Log credential data for debugging JSON-LD issues
    this.logCredentialDataForDebugging(
      invitationId,
      holderId,
      credentialSubject,
    );

    let expirationDate: Date;
    if (options.expirationDate) {
      expirationDate = new Date(options.expirationDate);
    } else {
      expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + (options.expirationDays || 7),
      );
    }
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/bbs/v1',
        {
          '@vocab': 'https://www.w3.org/ns/credentials/examples#',
          name: 'http://schema.org/name',
          description: 'http://schema.org/description',
          identifier: 'http://schema.org/identifier',
        },
      ],
      name: options.displayTitle,
      id: `urn:uuid:${this.ensureStringId(invitationId, 'credential.id')}`,
      type: ['VerifiableCredential', ...(options.type || [])],
      issuer: {
        id: this.ensureStringId(issuer.id, 'issuer.id'),
        name: issuer.name,
      },
      issuanceDate: new Date(),
      expirationDate,
      credentialSubject: {
        id: this.ensureStringId(holderId, 'credentialSubject.id'),
        ...this.sanitizeCredentialSubject(credentialSubject),
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
          text: options.displayTitle ?? 'AutoPen Credential',
        },
        subtitle: {
          text: options.displaySubtitle ?? 'Verified Credential',
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
    Logger.log('🎁 Creating WACI credential offer', {
      invitationId,
      holderId,
      issuerName: issuer.name,
      credentialTypes: options.type,
    });

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

    const issuerDisplay = this.buildIssuerDisplay(options.displayTitle, styles);

    const credentialOffer = new WACICredentialOfferSucceded({
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

    Logger.log('✅ WACI credential offer created successfully', {
      invitationId,
      holderId,
      credentialTypes: options.type,
    });

    return credentialOffer;
  }
}
