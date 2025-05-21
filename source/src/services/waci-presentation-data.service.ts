import { Injectable } from '@nestjs/common';
import { InputDescriptor } from '@extrimian/agent/node_modules/@extrimian/waci/dist/types/credential-manifest'; // Import InputDescriptor from the library

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