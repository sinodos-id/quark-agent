import { WACIMessage } from '@extrimian/agent';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'waci-messages' })
export class WACIMessageThread {
  @Prop()
  threadId: string;
  @Prop([Object])
  messages: WACIMessage[];
}

export const WACIMessageThreadSchema =
  SchemaFactory.createForClass(WACIMessageThread);
