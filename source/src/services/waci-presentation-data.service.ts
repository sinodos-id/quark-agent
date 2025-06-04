import { Injectable } from '@nestjs/common';
import { InputDescriptor } from '@extrimian/waci'; // Import InputDescriptor directly from @extrimian/waci

@Injectable()
export class WaciPresentationDataService {
  private presentationDataMap = new Map<string, InputDescriptor[]>();

  storeData(invitationId: string, data: InputDescriptor[]): void {
    this.presentationDataMap.set(invitationId, data);
  }

  getData(invitationId: string): InputDescriptor[] | undefined {
    return this.presentationDataMap.get(invitationId);
  }

  removeData(invitationId: string): void {
    this.presentationDataMap.delete(invitationId);
  }
}
