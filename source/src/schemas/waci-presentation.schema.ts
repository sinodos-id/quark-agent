import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InputDescriptor } from '@extrimian/waci';

@Schema({ timestamps: true })
export class WaciPresentation extends Document {
  @Prop({ required: true, unique: true, index: true })
  invitationId: string;

  @Prop({ required: true, type: Object })
  presentationData: InputDescriptor[];
}

export const WaciPresentationSchema =
  SchemaFactory.createForClass(WaciPresentation);
