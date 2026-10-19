import Dexie, { type EntityTable } from 'dexie';
import type { NumeroTrimestre, Practica } from '../domain/programa';

export const VERSION_ESQUEMA = 1;
export const NOMBRE_BASE = 'mahamudrapp';

export type TipoSesion = 'shine' | 'preliminar';

/** Registro de práctica: solo se agrega, nunca se edita ni se borra. */
export interface Sesion {
  id: string;
  tipo: TipoSesion;
  /** 'app' si se registró el mismo día; 'manual' si se cargó después. */
  origen: 'app' | 'manual';
  fechaLocal: string;
  inicio?: string;
  fin?: string;
  duracionSeg: number;
  /** Contexto del programa en esa fecha; falta si la fecha es anterior al inicio. */
  trimestre?: NumeroTrimestre;
  diaSemana: number;
  reflexion?: string;
  soporte?: string;
  pasosCompletados: string[];
  nota?: string;
  creadoEn: string;
  dispositivoId: string;
  version: number;
}

export type OrigenConteo = 'contador' | 'manual' | 'correccion' | 'sesion' | 'importacion';

/** Registro de práctica: solo se agrega. Una corrección es otro registro con cantidad negativa. */
export interface Conteo {
  id: string;
  practica: Practica;
  cantidad: number;
  origen: OrigenConteo;
  sesionId?: string;
  corrigeId?: string;
  fechaLocal: string;
  creadoEn: string;
  dispositivoId: string;
  version: number;
}

export interface Ajuste {
  clave: string;
  valor: unknown;
  actualizadoEn: string;
}

/** Log de copias de respaldo hechas. */
export interface Respaldo {
  id: string;
  creadoEn: string;
  fechaLocal: string;
  metodo: 'compartir' | 'descarga';
  registros: number;
}

/**
 * Conteo en curso, aún no consolidado. Se escribe con cada toque para no perder nada
 * si el teléfono se apaga, y al terminar se convierte en un único Conteo.
 * No es un registro de práctica: esta tabla sí se modifica.
 */
export interface Borrador {
  practica: Practica;
  /** Día al que pertenece: el del primer toque. */
  fechaLocal: string;
  iniciadoEn: string;
  actualizadoEn: string;
  /** Cada suma, en orden, para poder deshacer la última. */
  pasos: number[];
}

export class BaseMahamudra extends Dexie {
  sesiones!: EntityTable<Sesion, 'id'>;
  conteos!: EntityTable<Conteo, 'id'>;
  ajustes!: EntityTable<Ajuste, 'clave'>;
  respaldos!: EntityTable<Respaldo, 'id'>;
  borradores!: EntityTable<Borrador, 'practica'>;

  constructor(nombre: string = NOMBRE_BASE) {
    super(nombre);
    this.version(1).stores({
      sesiones: 'id, fechaLocal, tipo, [tipo+fechaLocal]',
      conteos: 'id, fechaLocal, practica, [practica+fechaLocal]',
      ajustes: 'clave',
      respaldos: 'id, creadoEn',
      borradores: 'practica',
    });
  }
}
