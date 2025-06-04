import { Injectable } from '@nestjs/common';
import { Logger } from '../utils/logger';

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
  styles?: any;
  issuer?: any;
}

@Injectable()
export class WaciCredentialDataService {
  private credentialDataMap = new Map<string, StoredCredentialData>();

  storeData(invitationId: string, data: StoredCredentialData): void {
    Logger.log('💾 Storing credential data in memory', { invitationId });
    this.credentialDataMap.set(invitationId, data);
  }

  getData(invitationId: string): StoredCredentialData | undefined {
    const data = this.credentialDataMap.get(invitationId);
    Logger.log('🔍 Retrieving credential data from memory', {
      invitationId,
      found: !!data,
    });
    return data;
  }

  removeData(invitationId: string): void {
    this.credentialDataMap.delete(invitationId);
    Logger.log('🗑️ Removed credential data from memory', { invitationId });
  }
}

export { StoredCredentialData };
