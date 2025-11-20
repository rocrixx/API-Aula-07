import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DescarteModule } from './descarte/descarte.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'descarte', 'public'),
      exclude: ['/api*'], 
    }),

    MongooseModule.forRoot('mongodb://localhost:27017/descarte'),

    DescarteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
