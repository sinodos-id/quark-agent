import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAgentStorage } from '@extrimian/agent';
import { StorageDocument } from '../schemas/storage.schema';
import { MongoStorageBase } from './mongo-storage.base';

@Injectable()
export class MongoAgentStorage
  extends MongoStorageBase
  implements IAgentStorage
{
  constructor(
    @InjectModel('agent_storage')
    model: Model<StorageDocument>,
  ) {
    super(model, 'agent_storage');
  }

  async add(key: string, data: any): Promise<void> {
    return super.add(key, data);
  }

  async get(key: string): Promise<any> {
    return super.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return super.getAll();
  }

  async update(key: string, data: any): Promise<void> {
    return super.update(key, data);
  }

  async remove(key: string): Promise<void> {
    return super.remove(key);
  }
}

@Injectable()
export class MongoVCStorage extends MongoStorageBase implements IAgentStorage {
  constructor(
    @InjectModel('vc_storage')
    model: Model<StorageDocument>,
  ) {
    super(model, 'vc_storage');
  }

  async add(key: string, data: any): Promise<void> {
    return super.add(key, data);
  }

  async get(key: string): Promise<any> {
    return super.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return super.getAll();
  }

  async update(key: string, data: any): Promise<void> {
    return super.update(key, data);
  }

  async remove(key: string): Promise<void> {
    return super.remove(key);
  }
}

@Injectable()
export class MongoSecureStorage
  extends MongoStorageBase
  implements IAgentStorage
{
  constructor(
    @InjectModel('secure_storage')
    model: Model<StorageDocument>,
  ) {
    super(model, 'secure_storage');
  }

  async add(key: string, data: any): Promise<void> {
    return super.add(key, data);
  }

  async get(key: string): Promise<any> {
    return super.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return super.getAll();
  }

  async update(key: string, data: any): Promise<void> {
    return super.update(key, data);
  }

  async remove(key: string): Promise<void> {
    return super.remove(key);
  }
}
