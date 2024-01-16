import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../src/controllers/health.controller';

describe('AppController', () => {
  let appController: HealthController;

  beforeEach(async () => {
    process.env.PORT = '3000';
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    appController = app.get<HealthController>(HealthController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.ping()).toBe('Running on port 3000');
    });
  });
});
