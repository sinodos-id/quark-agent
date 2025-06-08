import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IVCStorage, DID } from '@extrimian/agent'; // Import DID

export class JsonVcStorage implements IVCStorage {
  public readonly filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  private getKey(did: DID, credentialId: string): string {
    return `${did.value}#${credentialId}`; // Use did.value if DID is an object with a value property
  }

  async add(did: DID, credentialId: string, data: any): Promise<void> {
    const map = this.getData();
    const key = this.getKey(did, credentialId);
    map.set(key, data);
    this.saveData(map);
  }

  async get(did: DID, credentialId: string): Promise<any> {
    const key = this.getKey(did, credentialId);
    return this.getData().get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return this.getData();
  }

  async update(did: DID, credentialId: string, value: any): Promise<void> {
    const map = this.getData();
    const key = this.getKey(did, credentialId);
    map.set(key, value);
    this.saveData(map);
  }

  async remove(did: DID, credentialId: string): Promise<any> {
    const map = this.getData();
    const key = this.getKey(did, credentialId);
    const deleted = map.delete(key);
    this.saveData(map);
    return deleted;
  }

  async save(did: DID, vc: any): Promise<any> {
    const map = this.getData();
    const credentialId = vc.id;
    const key = this.getKey(did, credentialId);
    map.set(key, vc);
    this.saveData(map);
    return vc;
  }

  async getById(credentialId: string): Promise<any | undefined> {
    const map = this.getData();
    for (const [key, value] of map.entries()) {
      const parts = key.split('#');
      if (parts.length === 2 && parts[1] === credentialId) {
        return value;
      }
    }
    return undefined; // Not found
  }

  async getAllByDID(did: DID): Promise<Map<string, any>> {
    const map = this.getData();
    const result = new Map<string, any>();
    const didPrefix = `${did.value}#`;
    // Filter entries by DID prefix
    for (const [key, value] of map.entries()) {
      if (key.startsWith(didPrefix)) {
        result.set(key, value);
      }
    }
    return result;
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
