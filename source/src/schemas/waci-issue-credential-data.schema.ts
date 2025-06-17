import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WaciIssueCredentialData extends Document {
  @Prop({ required: true, unique: true, index: true })
  invitationId: string;

  @Prop({ required: true })
  issuerDid: string;

  @Prop({ required: true })
  nameDid: string;

  @Prop({ required: true, type: Object })
  credentialSubject: any;

  @Prop({ required: true, type: Object })
  options: any;

  @Prop({ type: Object })
  styles?: any;

  @Prop({ type: Object })
  issuer?: any;
}

export const WaciIssueCredentialDataSchema = SchemaFactory.createForClass(
  WaciIssueCredentialData,
);
