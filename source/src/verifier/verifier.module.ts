import { Module } from '@nestjs/common';
import { VerifierController } from './verifier.controller';
import { CoreModule } from '../core/core.module';

// TODO: A better structure would be to have a dedicated AgentModule that provides
// and exports the AgentProvider and other core services. This would avoid
// providing them directly here and in the AppModule.
@Module({
  imports: [CoreModule],
  controllers: [VerifierController],
  providers: [],
})
export class VerifierModule {}