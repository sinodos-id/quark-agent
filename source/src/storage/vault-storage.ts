import { KMSVaultStorage } from '@extrimian/kms-storage-vault';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG, Configuration } from '../config';
import { AgentSecureStorage } from '@extrimian/agent';

@Injectable()
export class VaultStorage implements AgentSecureStorage {
  private vault: KMSVaultStorage;
  constructor(@Inject(CONFIG) config: Configuration) {
    this.vault = new KMSVaultStorage({
      roleId: config.VAULT_ROLE_ID,
      secretId: config.VAULT_SECRET_ID,
      vaultUrl: config.VAULT_URL,
      expirationThresholdMillis: 24000
    });
  }

  async add(key: string, data: any): Promise<void> {
    return this.vault.add(key, { data });
  }

  async get(key: string): Promise<any> {
    const secret = await this.vault.get(key);
    return secret.data;
  }

  async getAll(): Promise<Map<string, any>> {
    const secretMap = await this.vault.getAll();
    const result = new Map<string, any>();
    secretMap.forEach((value, key) => {
      result.set(key, value.data);
    });
    return result;
  }

  async update(key: string, data: any): Promise<void> {
    return this.vault.update(key, { data });
  }

  async remove(key: string): Promise<void> {
    return this.vault.remove(key);
  }
}
