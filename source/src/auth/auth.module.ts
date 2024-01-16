import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategy/apitoken.strategy';

@Module({
  imports:[PassportModule],
  providers: [AuthService, ApiKeyStrategy],
  exports: [ AuthService]
})
export class AuthModule {}
