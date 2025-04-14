import { Injectable } from '@nestjs/common';
import { AgentSecureStorage } from '@extrimian/agent';

@Injectable()
export class MemoryStorage implements AgentSecureStorage {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map<string, any>();
  }

  async add(key: string, data: any): Promise<void> {
    this.storage.set(key, data);
  }

  async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return new Map(this.storage);
  }

  async update(key: string, data: any): Promise<void> {
    this.storage.set(key, data);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }
}