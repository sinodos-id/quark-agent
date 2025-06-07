import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IAgentStorage } from '@extrimian/agent';

export class JsonAgentStorage implements IAgentStorage {
  public readonly filepath: string;

  constructor(params: { filepath: string }) {
    this.filepath = params.filepath;
  }

  async update<T>(key: string, value: T): Promise<void> {
    const map = this.getData();
    map.set(key, value);
    this.saveData(map);
  }

  async getAll(): Promise<Map<string, any>> {
    return this.getData();
  }

  async remove(key: string): Promise<void> {
    const map = this.getData();
    map.delete(key);
    this.saveData(map);
  }

  async add(key: string, data: any): Promise<void> {
    const map = this.getData();
    map.set(key, data);
    this.saveData(map);
  }

  async get(key: string): Promise<any> {
    return this.getData().get(key);
  }

  private getData(): Map<string, any> {
    if (!existsSync(this.filepath)) {
      return new Map();
    }

    const file = readFileSync(this.filepath, {
      encoding: 'utf-8',
    });

    if (!file) {
      return new Map();
    }

    return new Map(Object.entries(JSON.parse(file)));
  }

  private saveData(data: Map<string, any>) {
    writeFileSync(this.filepath, JSON.stringify(Object.fromEntries(data)), {
      encoding: 'utf-8',
    });
  }
}
