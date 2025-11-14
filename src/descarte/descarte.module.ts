import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PontoDescarte, PontoDescarteSchema, RegistroDescarte, RegistroDescarteSchema } from './descarte.model';
import { DescarteController } from './descarte.controller';
import { DescarteService } from './descarte.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PontoDescarte.name, schema: PontoDescarteSchema },
      { name: RegistroDescarte.name, schema: RegistroDescarteSchema },
    ]),
  ],
  controllers: [DescarteController],
  providers: [DescarteService],
})
export class DescarteModule {}
