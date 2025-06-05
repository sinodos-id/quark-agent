import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/config';

@Injectable()
export class AuthService {
  validateApiToken(apitoken: string) {
    const apiToken: string = ConfigProvider.useValue.TOKEN_SECRET;
    return apitoken === apiToken;
  }
}
