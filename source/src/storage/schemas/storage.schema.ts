import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StorageDocument extends Document {
  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true, type: Object })
  value: any;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const StorageSchema = SchemaFactory.createForClass(StorageDocument);

// Ensure key is unique within each collection
StorageSchema.index({ key: 1 }, { unique: true });