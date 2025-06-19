import { InputDescriptor } from '@extrimian/agent';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WaciPresentationDataService {
  private presentationDataMap = new Map<string, InputDescriptor[]>();
  private threadToInvitationMap = new Map<string, string>();

  storeData(invitationId: string, data: InputDescriptor[]): void {
    this.presentationDataMap.set(invitationId, data);
  }

  getData(invitationId: string): InputDescriptor[] | undefined {
    return this.presentationDataMap.get(invitationId);
  }

  removeData(invitationId: string): void {
    this.presentationDataMap.delete(invitationId);
    for (const [
      thid,
      storedInvitationId,
    ] of this.threadToInvitationMap.entries()) {
      if (storedInvitationId === invitationId) {
        this.threadToInvitationMap.delete(thid);
        break;
      }
    }
  }

  storeThreadMapping(thid: string, invitationId: string): void {
    this.threadToInvitationMap.set(thid, invitationId);
  }

  getInvitationIdFromThread(thid: string): string | undefined {
    return this.threadToInvitationMap.get(thid);
  }

  findInvitationIdWithData(): string | undefined {
    for (const [invitationId] of this.presentationDataMap.entries()) {
      return invitationId;
    }
    return undefined;
  }

  getAllStoredInvitationIds(): string[] {
    return Array.from(this.presentationDataMap.keys());
  }
}
