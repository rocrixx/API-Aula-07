import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { DescarteService } from './descarte.service';
import { TipoLocal, TipoResiduo } from './descarte.model';

@Controller()
export class DescarteController {
  constructor(private readonly descarteService: DescarteService) {}

  @Get('pontos-descarte')
  listarPontos() {
    return this.descarteService.listarPontos();
  }

  @Post('pontos-descarte')
  criarPonto(@Body() corpo: any) {
    const {
      nomeLocal,
      bairro,
      tipoLocal,
      categoriasResiduosAceitos,
      latitude,
      longitude,
    } = corpo;

    if (
      !nomeLocal ||
      !bairro ||
      !tipoLocal ||
      latitude === undefined ||
      longitude === undefined
    ) {
      throw new BadRequestException(
        'nomeLocal, bairro, tipoLocal, latitude e longitude são obrigatórios',
      );
    }

    if (tipoLocal !== 'publico' && tipoLocal !== 'privado') {
      throw new BadRequestException(
        "tipoLocal deve ser 'publico' ou 'privado'",
      );
    }

    const categorias =
      categoriasResiduosAceitos && Array.isArray(categoriasResiduosAceitos)
        ? categoriasResiduosAceitos
        : [];

    return this.descarteService.criarPonto({
      nomeLocal,
      bairro,
      tipoLocal: tipoLocal as TipoLocal,
      categoriasResiduosAceitos: categorias,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  }

  @Get('registros-descarte')
  listarRegistros(
    @Query('pontoId') pontoId?: string,
    @Query('tipoResiduo') tipoResiduo?: string,
    @Query('data') data?: string,
    @Query('nomeUsuario') nomeUsuario?: string,
  ) {
    return this.descarteService.listarRegistros({
      pontoId: pontoId ? Number(pontoId) : undefined,
      tipoResiduo,
      data,
      nomeUsuario,
    });
  }

  @Post('registros-descarte')
  registrarDescarte(@Body() corpo: any) {
    const { nomeUsuario, pontoId, tipoResiduo, data } = corpo;

    if (!nomeUsuario || !pontoId || !tipoResiduo) {
      throw new BadRequestException(
        'nomeUsuario, pontoId e tipoResiduo são obrigatórios',
      );
    }

    const tiposPermitidos: TipoResiduo[] = [
      'plastico',
      'papel',
      'organico',
      'eletronico',
      'vidro',
    ];

    if (!tiposPermitidos.includes(tipoResiduo)) {
      console.warn(
        `Tipo de resíduo diferente do padrão: ${tipoResiduo} (permitidos: ${tiposPermitidos.join(
          ', ',
        )})`,
      );
    }

    try {
      return this.descarteService.registrarDescarte({
        nomeUsuario,
        pontoId: Number(pontoId),
        tipoResiduo,
        data,
      });
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('relatorio')
  obterRelatorio() {
    return this.descarteService.gerarRelatorio();
  }
}
