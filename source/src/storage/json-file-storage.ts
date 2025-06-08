import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IAgentStorage, AgentSecureStorage } from '@extrimian/agent';

export class JsonFileStorage implements IAgentStorage, AgentSecureStorage {
  public readonly filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async add(key: string, data: any): Promise<void> {
    const map = this.getData();
    map.set(key, data);
    this.saveData(map);
  }

  async get(key: string): Promise<any> {
    return this.getData().get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return this.getData();
  }

  async update(key: string, value: any): Promise<void> {
    const map = this.getData();
    map.set(key, value);
    this.saveData(map);
  }

  async remove(key: string): Promise<void> {
    const map = this.getData();
    map.delete(key);
    this.saveData(map);
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

    try {
      const parsedData = JSON.parse(file);
      // Ensure parsed data is an object before converting to Map
      if (typeof parsedData === 'object' && parsedData !== null) {
        return new Map(Object.entries(parsedData));
      } else {
        // Handle cases where the file content is not a valid JSON object
        console.error(`Invalid JSON data in ${this.filepath}`);
        return new Map();
      }
    } catch (error) {
      console.error(`Error parsing JSON file ${this.filepath}:`, error);
      return new Map();
    }
  }

  private saveData(data: Map<string, any>) {
    writeFileSync(
      this.filepath,
      JSON.stringify(Object.fromEntries(data), null, 2),
      {
        encoding: 'utf-8',
      },
    );
  }
}
