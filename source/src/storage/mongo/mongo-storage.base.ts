import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { StorageDocument } from '../schemas/storage.schema';
import { Logger } from '../../utils/logger';

@Injectable()
export abstract class MongoStorageBase {
  constructor(
    protected readonly model: Model<StorageDocument>,
    private readonly collectionName: string,
  ) {}

  protected async add(key: string, data: any): Promise<void> {
    try {
      Logger.debug('Adding storage data', {
        key,
        collection: this.collectionName,
      });
      await this.model.create({ key, value: data });
    } catch (error) {
      Logger.error('Failed to add storage data', error, {
        key,
        collection: this.collectionName,
      });
      throw new Error(`Failed to add storage data: ${error.message}`);
    }
  }

  protected async get(key: string): Promise<any> {
    try {
      const doc = await this.model.findOne({ key }).exec();
      Logger.debug('Retrieved storage data', {
        key,
        collection: this.collectionName,
        found: !!doc,
      });
      return doc?.value;
    } catch (error) {
      Logger.error('Failed to get storage data', error, {
        key,
        collection: this.collectionName,
      });
      throw new Error(`Failed to get storage data: ${error.message}`);
    }
  }

  protected async getAll(): Promise<Map<string, any>> {
    try {
      const docs = await this.model.find().exec();
      const map = new Map<string, any>();
      docs.forEach((doc) => map.set(doc.key, doc.value));

      Logger.debug('Retrieved all storage data', {
        collection: this.collectionName,
        size: map.size,
      });
      return map;
    } catch (error) {
      Logger.error('Failed to get all storage data', error, {
        collection: this.collectionName,
      });
      throw new Error(`Failed to get all storage data: ${error.message}`);
    }
  }

  protected async update(key: string, data: any): Promise<void> {
    try {
      Logger.debug('Updating storage data', {
        key,
        collection: this.collectionName,
      });
      await this.model.findOneAndUpdate(
        { key },
        { value: data },
        { upsert: true, new: true },
      );
    } catch (error) {
      Logger.error('Failed to update storage data', error, {
        key,
        collection: this.collectionName,
      });
      throw new Error(`Failed to update storage data: ${error.message}`);
    }
  }

  protected async remove(key: string): Promise<void> {
    try {
      Logger.debug('Removing storage data', {
        key,
        collection: this.collectionName,
      });
      await this.model.deleteOne({ key });
    } catch (error) {
      Logger.error('Failed to remove storage data', error, {
        key,
        collection: this.collectionName,
      });
      throw new Error(`Failed to remove storage data: ${error.message}`);
    }
  }
}
