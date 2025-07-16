import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WaciPresentation } from '../schemas/waci-presentation.schema';
import { Logger } from '../utils/logger';
import { InputDescriptor } from '@extrimian/agent';

@Injectable()
export class CredentialPresentationMongoStorage {
  private threadToInvitationMap = new Map<string, string>();

  constructor(
    @InjectModel(WaciPresentation.name)
    private presentationModel: Model<WaciPresentation>,
  ) {}

  async storeData(
    invitationId: string,
    data: InputDescriptor[],
  ): Promise<void> {
    try {
      await this.presentationModel.findOneAndUpdate(
        { invitationId },
        { invitationId, presentationData: data },
        { upsert: true, new: true },
      );
      Logger.debug('Stored presentation data', { invitationId });
    } catch (error) {
      Logger.error('Failed to store presentation data', error, {
        invitationId,
      });
      throw error;
    }
  }

  async getData(invitationId: string): Promise<InputDescriptor[] | undefined> {
    try {
      const doc = await this.presentationModel.findOne({ invitationId });
      return doc?.presentationData;
    } catch (error) {
      Logger.error('Failed to get presentation data', error, { invitationId });
      throw error;
    }
  }

  async removeData(invitationId: string): Promise<void> {
    try {
      await this.presentationModel.deleteOne({ invitationId });
      Logger.debug('Removed presentation data', { invitationId });
    } catch (error) {
      Logger.error('Failed to remove presentation data', error, {
        invitationId,
      });
      throw error;
    }
  }

  async getAllStoredInvitationIds(): Promise<string[]> {
    try {
      const docs = await this.presentationModel.find().select('invitationId');
      return docs.map((doc) => doc.invitationId);
    } catch (error) {
      Logger.error('Failed to get all invitation IDs', error);
      throw error;
    }
  }

  storeThreadMapping(thid: string, invitationId: string): void {
    this.threadToInvitationMap.set(thid, invitationId);
    Logger.debug('Stored thread mapping', { thid, invitationId });
  }

  getInvitationIdFromThread(thid: string): string | undefined {
    const invitationId = this.threadToInvitationMap.get(thid);
    Logger.debug('Retrieved invitation ID from thread', { thid, invitationId });
    return invitationId;
  }

  findInvitationIdWithData(): string | undefined {
    // For now, return the first invitation ID from the in-memory map
    // This is a fallback method and should ideally be replaced with proper async handling
    for (const [, invitationId] of this.threadToInvitationMap.entries()) {
      Logger.debug('Found invitation ID with data (fallback)', {
        invitationId,
      });
      return invitationId;
    }
    Logger.debug('No invitation ID found with data (fallback)');
    return undefined;
  }
}
