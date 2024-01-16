import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CONFIG, Configuration } from '../config';

@Injectable()
export class SsiIntegrationService {
  private baseUrl;
  constructor(@Inject(CONFIG) private config: Configuration) {
    this.baseUrl = config.SSI_INTEGRATION_API_URL;
  }

  async getCredentialsDataByInvitationId<T>(invitationId: string): Promise<T> {
    const response = await axios.get<T>(
      `${this.baseUrl}/vc-data/${invitationId}`,
    );
    return response.data;
  }

  async getPresentationContextsByInvitationId<T>(
    invitationId: string,
  ): Promise<T> {
    const response = await axios.get<T>(
      `${this.baseUrl}/presentation-context/${invitationId}`,
    );
    return response.data;
  }
}
