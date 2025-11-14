import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PontoDescarte, PontoDescarteDocument, RegistroDescarte, RegistroDescarteDocument, TipoLocal, TipoResiduo } from './descarte.model';

@Injectable()
export class DescarteService {
  constructor(
    @InjectModel(PontoDescarte.name)
    private readonly pontoModel: Model<PontoDescarteDocument>,
    @InjectModel(RegistroDescarte.name)
    private readonly registroModel: Model<RegistroDescarteDocument>,
  ) {}

  async listarPontos(): Promise<PontoDescarte[]> {
    return this.pontoModel.find().sort({ id: 1 }).exec();
  }

  async buscarPontoPorId(id: number): Promise<PontoDescarte | null> {
    return this.pontoModel.findOne({ id }).exec();
  }

  async criarPonto(dados: {
    nomeLocal: string;
    bairro: string;
    tipoLocal: TipoLocal;
    categoriasResiduosAceitos: string[];
    latitude: number;
    longitude: number;
  }): Promise<PontoDescarte> {
    const total = await this.pontoModel.countDocuments().exec();

    const novoPonto = new this.pontoModel({
      id: total + 1,
      nomeLocal: dados.nomeLocal,
      bairro: dados.bairro,
      tipoLocal: dados.tipoLocal,
      categoriasResiduosAceitos: dados.categoriasResiduosAceitos,
      latitude: dados.latitude,
      longitude: dados.longitude,
    });

    return novoPonto.save();
  }

  async listarRegistros(filtro?: {
    pontoId?: number;
    tipoResiduo?: string;
    data?: string;
    nomeUsuario?: string;
  }): Promise<RegistroDescarte[]> {
    let resultado = await this.registroModel.find().exec();

    if (filtro?.pontoId) {
      resultado = resultado.filter((r) => r.pontoId === filtro.pontoId);
    }

    if (filtro?.tipoResiduo) {
      resultado = resultado.filter(
        (r) =>
          r.tipoResiduo.toLowerCase() === filtro.tipoResiduo!.toLowerCase(),
      );
    }

    if (filtro?.nomeUsuario) {
      resultado = resultado.filter((r) =>
        r.nomeUsuario
          .toLowerCase()
          .includes(filtro.nomeUsuario!.toLowerCase()),
      );
    }

    if (filtro?.data) {
      resultado = resultado.filter((r) => {
        const dataRegistro = r.data.toISOString().substring(0, 10);
        return dataRegistro === filtro.data;
      });
    }

    return resultado;
  }

  async registrarDescarte(dados: {
    nomeUsuario: string;
    pontoId: number;
    tipoResiduo: TipoResiduo;
    data?: string;
  }): Promise<RegistroDescarte> {
    const ponto = await this.buscarPontoPorId(dados.pontoId);
    if (!ponto) {
      throw new Error('Ponto de descarte não encontrado');
    }

    const dataRegistro = dados.data ? new Date(dados.data) : new Date();

    const total = await this.registroModel.countDocuments().exec();

    const novoRegistro = new this.registroModel({
      id: total + 1,
      nomeUsuario: dados.nomeUsuario,
      pontoId: dados.pontoId,
      tipoResiduo: dados.tipoResiduo,
      data: dataRegistro,
    });

    return novoRegistro.save();
  }

  async gerarRelatorio() {
    const pontos = await this.pontoModel.find().exec();
    const registros = await this.registroModel.find().exec();

    const totalPontos = pontos.length;

    let localMaisRegistros: PontoDescarte | null = null;

    if (registros.length > 0) {
      const contagemPorPonto = new Map<number, number>();

      for (const registro of registros) {
        contagemPorPonto.set(
          registro.pontoId,
          (contagemPorPonto.get(registro.pontoId) || 0) + 1,
        );
      }

      let maxId: number | null = null;
      let maxQtd = 0;

      contagemPorPonto.forEach((qtd, pontoId) => {
        if (qtd > maxQtd) {
          maxQtd = qtd;
          maxId = pontoId;
        }
      });

      if (maxId !== null) {
        const encontrado = pontos.find((p) => p.id === maxId);
        localMaisRegistros = encontrado || null;
      }
    }

    let tipoResiduoMaisFrequente: string | null = null;

    if (registros.length > 0) {
      const contagemPorResiduo = new Map<string, number>();

      for (const registro of registros) {
        const tipo = registro.tipoResiduo.toLowerCase();
        contagemPorResiduo.set(tipo, (contagemPorResiduo.get(tipo) || 0) + 1);
      }

      let maxTipo: string | null = null;
      let maxQtd = 0;

      contagemPorResiduo.forEach((qtd, tipo) => {
        if (qtd > maxQtd) {
          maxQtd = qtd;
          maxTipo = tipo;
        }
      });

      tipoResiduoMaisFrequente = maxTipo;
    }

    const agora = new Date();
    const dia = 24 * 60 * 60 * 1000;

    const trintaDiasAtras = new Date(agora.getTime() - 30 * dia);
    const sessentaDiasAtras = new Date(agora.getTime() - 60 * dia);

    const ultimos30 = registros.filter(
      (r) => r.data >= trintaDiasAtras && r.data <= agora,
    );

    const mediaDescartesPorDia = ultimos30.length / 30;

    const periodoAnterior = registros.filter(
      (r) => r.data >= sessentaDiasAtras && r.data < trintaDiasAtras,
    );

    const totalAtual = ultimos30.length;
    const totalAnterior = periodoAnterior.length;

    let variacao = 0;

    if (totalAnterior === 0 && totalAtual > 0) {
      variacao = 100;
    } else if (totalAnterior > 0) {
      variacao = ((totalAtual - totalAnterior) / totalAnterior) * 100;
    }

    const usuariosUnicos = new Set(registros.map((r) => r.nomeUsuario));

    return {
      localDescarteComMaiorNumeroRegistros: localMaisRegistros,
      tipoResiduoMaisFrequente,
      mediaDescartesPorDiaUltimos30: mediaDescartesPorDia,
      numeroTotalUsuarios: usuariosUnicos.size,
      totalPontosDescarte: totalPontos,
      variacaoPercentualVolumeDescartesUltimos30DiasVsAnterior: variacao,
    };
  }
}
