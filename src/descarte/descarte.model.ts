import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TipoLocal = 'publico' | 'privado';

export type TipoResiduo =
  | 'plastico'
  | 'papel'
  | 'organico'
  | 'eletronico'
  | 'vidro'
  | string;

export type PontoDescarteDocument = PontoDescarte & Document;
export type RegistroDescarteDocument = RegistroDescarte & Document;

@Schema({ collection: 'pontos_descarte' })
export class PontoDescarte {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  nomeLocal: string;

  @Prop({ required: true })
  bairro: string;

  @Prop({ required: true })
  tipoLocal: TipoLocal;

  @Prop({ type: [String], default: [] })
  categoriasResiduosAceitos: string[];

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export const PontoDescarteSchema = SchemaFactory.createForClass(PontoDescarte);

@Schema({ collection: 'registros_descarte' })
export class RegistroDescarte {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  nomeUsuario: string;

  @Prop({ required: true })
  pontoId: number;

  @Prop({ required: true })
  tipoResiduo: TipoResiduo;

  @Prop({ required: true })
  data: Date;
}

export const RegistroDescarteSchema = SchemaFactory.createForClass(RegistroDescarte);
