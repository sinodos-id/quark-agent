import { Injectable } from '@nestjs/common';

interface StoredCredentialData {
  issuerDid: string;
  nameDid: string;
  credentialSubject: any;
  options: {
    expirationDays?: number;
    oneTimeUse?: boolean;
    displayTitle?: string;
    displaySubtitle?: string;
    displayDescription?: string;
    type: string[];
    heroImage?: string;
  };
  styles?: any; // Add styles property
  issuer?: any; // Add issuer property
}

@Injectable()
export class WaciCredentialDataService {
  private credentialDataMap = new Map<string, StoredCredentialData>();

  storeData(invitationId: string, data: StoredCredentialData): void {
    this.credentialDataMap.set(invitationId, data);
  }

  getData(invitationId: string): StoredCredentialData | undefined {
    return this.credentialDataMap.get(invitationId);
  }

  removeData(invitationId: string): void {
    this.credentialDataMap.delete(invitationId);
  }
}

export { StoredCredentialData };
