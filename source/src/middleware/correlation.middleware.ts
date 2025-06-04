import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<{
  correlationId: string;
}>();

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      req.headers['x-correlation-id']?.toString() || randomUUID();

    // Store correlation ID in request and response
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Store in AsyncLocalStorage for access throughout the request lifecycle
    asyncLocalStorage.run({ correlationId }, () => {
      next();
    });
  }
}
