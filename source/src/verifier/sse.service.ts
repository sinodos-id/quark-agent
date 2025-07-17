import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class SseService {
  private readonly emitter = new EventEmitter();

  emit(event: string, data: any) {
    this.emitter.emit(event, data);
  }

  subscribe(event: string, listener: (data: any) => void) {
    this.emitter.on(event, listener);
  }

  unsubscribe(event: string, listener: (data: any) => void) {
    this.emitter.removeListener(event, listener);
  }
}