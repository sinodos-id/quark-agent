import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InputDescriptor } from '@extrimian/waci';
import { WaciPresentation } from '../schemas/waci-presentation.schema';
import { Logger } from '../utils/logger';

@Injectable()
export class WaciPresentationMongoService {
  constructor(
    @InjectModel(WaciPresentation.name)
    private presentationModel: Model<WaciPresentation>,
  ) {}

  async storeData(invitationId: string, data: InputDescriptor[]): Promise<void> {
    try {
      await this.presentationModel.findOneAndUpdate(
        { invitationId },
        { invitationId, presentationData: data },
        { upsert: true, new: true },
      );
      Logger.debug('Stored presentation data', { invitationId });
    } catch (error) {
      Logger.error('Failed to store presentation data', error, { invitationId });
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
      Logger.error('Failed to remove presentation data', error, { invitationId });
      throw error;
    }
  }

  async getAllStoredInvitationIds(): Promise<string[]> {
    try {
      const docs = await this.presentationModel.find().select('invitationId');
      return docs.map(doc => doc.invitationId);
    } catch (error) {
      Logger.error('Failed to get all invitation IDs', error);
      throw error;
    }
  }
}