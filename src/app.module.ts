import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DescarteModule } from './descarte/descarte.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/descarte'),
    DescarteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
