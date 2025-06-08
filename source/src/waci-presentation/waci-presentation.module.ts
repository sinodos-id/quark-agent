import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WaciPresentation,
  WaciPresentationSchema,
} from '../schemas/waci-presentation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WaciPresentation.name, schema: WaciPresentationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class WaciPresentationModule {}
