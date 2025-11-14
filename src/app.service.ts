import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'OK',
      api: 'API - Descarte de Resíduos',
      autor: 'Caio Henrique',
      versao: '1.0.0',
    };
  }
}
