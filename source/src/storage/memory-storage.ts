import { Injectable } from '@nestjs/common';
import { AgentSecureStorage } from '@extrimian/agent';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

@Injectable()
export class JsonStorage implements AgentSecureStorage {
  private storagePath: string;
  private storageData: Map<string, any>;

  constructor() {
    this.storagePath = path.resolve('./storage/key.json');
    this.storageData = new Map<string, any>();
    this.ensureStorageDirectoryExists();
    this.loadData();
  }

  private ensureStorageDirectoryExists(): void {
    const directory = path.dirname(this.storagePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private loadData(): void {
    if (fs.existsSync(this.storagePath)) {
      try {
        const fileContent = fs.readFileSync(this.storagePath, 'utf8');
        const data = JSON.parse(fileContent);
        this.storageData = new Map(Object.entries(data));
      } catch (error) {
        Logger.error('Failed to load storage data', error, {
          path: this.storagePath,
        });
        this.storageData = new Map<string, any>();
      }
    }
  }

  private saveData(): void {
    try {
      const dataObject = Object.fromEntries(this.storageData);
      fs.writeFileSync(this.storagePath, JSON.stringify(dataObject, null, 2));
      Logger.debug('Successfully saved storage data', {
        path: this.storagePath,
        keys: Array.from(this.storageData.keys()),
      });
    } catch (error) {
      Logger.error('Failed to save storage data', error, {
        path: this.storagePath,
      });
      throw new Error('Failed to save storage data');
    }
  }

  async add(key: string, data: any): Promise<void> {
    Logger.debug('Adding storage data', { key });
    this.storageData.set(key, data);
    this.saveData();
  }

  async get(key: string): Promise<any> {
    const data = this.storageData.get(key);
    Logger.debug('Retrieved storage data', { key, found: !!data });
    return data;
  }

  async getAll(): Promise<Map<string, any>> {
    Logger.debug('Retrieved all storage data', {
      size: this.storageData.size,
    });
    return new Map(this.storageData);
  }

  async update(key: string, data: any): Promise<void> {
    Logger.debug('Updating storage data', { key });
    this.storageData.set(key, data);
    this.saveData();
  }

  async remove(key: string): Promise<void> {
    Logger.debug('Removing storage data', { key });
    this.storageData.delete(key);
    this.saveData();
  }
}
