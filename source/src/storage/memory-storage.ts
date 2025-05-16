import { Injectable } from '@nestjs/common';
import { AgentSecureStorage } from '@extrimian/agent';
import * as fs from 'fs';
import * as path from 'path';

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
        console.error('Failed to load storage data:', error);
        this.storageData = new Map<string, any>();
      }
    }
  }

  private saveData(): void {
    // Convert Map to Object before storing as JSON
    const dataObject = Object.fromEntries(this.storageData);
    fs.writeFileSync(this.storagePath, JSON.stringify(dataObject, null, 2));
  }

  async add(key: string, data: any): Promise<void> {
    this.storageData.set(key, data);
    this.saveData();
  }

  async get(key: string): Promise<any> {
    return this.storageData.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return new Map(this.storageData);
  }

  async update(key: string, data: any): Promise<void> {
    this.storageData.set(key, data);
    this.saveData();
  }

  async remove(key: string): Promise<void> {
    this.storageData.delete(key);
    this.saveData();
  }
}