import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-token',
) {
  constructor(private authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiToken, done) => {
      if (this.authService.validateApiToken(apiToken)) {
        done(null, true);
      }
      done(new UnauthorizedException(), null);
    });
  }
}
