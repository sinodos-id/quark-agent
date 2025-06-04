import { Injectable } from '@nestjs/common';
import { InputDescriptor } from '@extrimian/waci'; // Import InputDescriptor directly from @extrimian/waci

@Injectable()
export class WaciPresentationDataService {
  private presentationDataMap = new Map<string, InputDescriptor[]>();
  private threadToInvitationMap = new Map<string, string>(); // Maps thid to original invitation ID

  storeData(invitationId: string, data: InputDescriptor[]): void {
    this.presentationDataMap.set(invitationId, data);
  }

  getData(invitationId: string): InputDescriptor[] | undefined {
    return this.presentationDataMap.get(invitationId);
  }

  removeData(invitationId: string): void {
    this.presentationDataMap.delete(invitationId);
    // Also remove from thread mapping
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

  // Store mapping from thread ID to original invitation ID
  storeThreadMapping(thid: string, invitationId: string): void {
    this.threadToInvitationMap.set(thid, invitationId);
  }

  // Get original invitation ID from thread ID
  getInvitationIdFromThread(thid: string): string | undefined {
    return this.threadToInvitationMap.get(thid);
  }

  // Find invitation ID that has presentation data stored
  // This is a fallback method when thread mapping is not available
  findInvitationIdWithData(): string | undefined {
    for (const [invitationId] of this.presentationDataMap.entries()) {
      return invitationId; // Return the first one found
    }
    return undefined;
  }

  // Get all stored invitation IDs (for debugging)
  getAllStoredInvitationIds(): string[] {
    return Array.from(this.presentationDataMap.keys());
  }
}
