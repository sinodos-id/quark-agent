import { IAgentStorage, AgentSecureStorage } from '@extrimian/agent';
import mongoose from 'mongoose';
import { Logger } from '../utils/logger';

export class MongoStorage implements IAgentStorage, AgentSecureStorage {
  private collection: mongoose.Collection;
  private connectionPromise: Promise<void>;

  constructor(collectionName: string) {
    this.connectionPromise = this.connect(collectionName);
  }

  private async connect(collectionName: string): Promise<void> {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || '');
      }
      this.collection = mongoose.connection.collection(collectionName);

      Logger.debug('Connected to MongoDB', { collection: collectionName });
    } catch (error) {
      Logger.error('MongoDB connection error', error);
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    await this.connectionPromise;
  }

  async add(key: string, data: any): Promise<void> {
    try {
      await this.ensureConnection();
      await this.collection.updateOne(
        { key },
        { $set: { key, value: data } },
        { upsert: true },
      );
    } catch (error) {
      Logger.error('Failed to add data', error);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      await this.ensureConnection();
      const doc = await this.collection.findOne({ key });
      return doc?.value;
    } catch (error) {
      Logger.error('Failed to get data', error);
      throw error;
    }
  }

  async getAll(): Promise<Map<string, any>> {
    try {
      await this.ensureConnection();
      const docs = await this.collection.find().toArray();
      const map = new Map<string, any>();
      docs.forEach((doc) => map.set(doc.key, doc.value));
      return map;
    } catch (error) {
      Logger.error('Failed to get all data', error);
      throw error;
    }
  }

  async update(key: string, data: any): Promise<void> {
    try {
      await this.ensureConnection();
      await this.collection.updateOne(
        { key },
        { $set: { key, value: data } },
        { upsert: true },
      );
    } catch (error) {
      Logger.error('Failed to update data', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.collection.deleteOne({ key });
    } catch (error) {
      Logger.error('Failed to remove data', error);
      throw error;
    }
  }
}
