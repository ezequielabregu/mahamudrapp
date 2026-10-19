// Lectura y validación de una copia de seguridad (el JSON que genera exportar.ts).
// No toca la base: devuelve los registros válidos para que el repositorio los fusione.

import {
  VERSION_ESQUEMA,
  type Ajuste,
  type Borrador,
  type Conteo,
  type Respaldo,
  type Sesion,
} from '../db/schema';
import { esFechaValida } from '../domain/fechas';
import { esPractica } from '../domain/programa';

export interface CopiaLeida {
  exportadoEn: string;
  versionEsquema: number;
  sesiones: Sesion[];
  conteos: Conteo[];
  ajustes: Ajuste[];
  respaldos: Respaldo[];
  borradores: Borrador[];
  /** Registros que no pasaron la validación y no se van a importar. */
  descartados: number;
}

export type ResultadoLectura = { ok: true; copia: CopiaLeida } | { ok: false; error: string };

/** Ajustes que nunca se importan: son propios de cada teléfono o de un momento. */
const AJUSTES_LOCALES = new Set(['dispositivoId', 'shineEnCurso']);

const esTexto = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function esSesion(v: unknown): v is Sesion {
  return (
    esObjeto(v) &&
    esTexto(v.id) &&
    (v.tipo === 'shine' || v.tipo === 'preliminar') &&
    esTexto(v.fechaLocal) &&
    esFechaValida(v.fechaLocal) &&
    esNumero(v.duracionSeg) &&
    v.duracionSeg > 0 &&
    esTexto(v.creadoEn) &&
    Array.isArray(v.pasosCompletados)
  );
}

function esConteo(v: unknown): v is Conteo {
  return (
    esObjeto(v) &&
    esTexto(v.id) &&
    typeof v.practica === 'string' &&
    esPractica(v.practica) &&
    esNumero(v.cantidad) &&
    Number.isInteger(v.cantidad) &&
    v.cantidad !== 0 &&
    esTexto(v.fechaLocal) &&
    esFechaValida(v.fechaLocal) &&
    esTexto(v.creadoEn)
  );
}

function esAjuste(v: unknown): v is Ajuste {
  return esObjeto(v) && esTexto(v.clave) && 'valor' in v && !AJUSTES_LOCALES.has(v.clave);
}

function esRespaldo(v: unknown): v is Respaldo {
  return esObjeto(v) && esTexto(v.id) && esTexto(v.creadoEn) && esTexto(v.fechaLocal);
}

function esBorrador(v: unknown): v is Borrador {
  return (
    esObjeto(v) &&
    typeof v.practica === 'string' &&
    esPractica(v.practica) &&
    esTexto(v.fechaLocal) &&
    esFechaValida(v.fechaLocal) &&
    esTexto(v.iniciadoEn) &&
    Array.isArray(v.pasos) &&
    v.pasos.every((p) => Number.isInteger(p) && p > 0)
  );
}

/** Separa los elementos válidos de una lista y cuenta los que no lo son. */
function filtrar<T>(lista: unknown, valido: (v: unknown) => v is T): { validos: T[]; descartados: number } {
  if (!Array.isArray(lista)) return { validos: [], descartados: 0 };
  const validos = lista.filter(valido);
  return { validos, descartados: lista.length - validos.length };
}

/** Lee el texto de un archivo de copia. Rechaza lo que no sea una copia de esta app. */
export function leerCopia(texto: string): ResultadoLectura {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'El archivo no es una copia válida: no se pudo leer.' };
  }
  if (!esObjeto(datos) || datos.app !== 'mahamudrapp' || !esObjeto(datos.tablas)) {
    return { ok: false, error: 'El archivo no es una copia de esta app.' };
  }
  if (!esNumero(datos.versionEsquema) || datos.versionEsquema > VERSION_ESQUEMA) {
    return {
      ok: false,
      error: 'La copia es de una versión más nueva de la app. Actualizá la app y probá de nuevo.',
    };
  }

  const t = datos.tablas;
  const sesiones = filtrar(t.sesiones, esSesion);
  const conteos = filtrar(t.conteos, esConteo);
  const ajustes = filtrar(t.ajustes, esAjuste);
  const respaldos = filtrar(t.respaldos, esRespaldo);
  const borradores = filtrar(t.borradores, esBorrador);

  return {
    ok: true,
    copia: {
      exportadoEn: esTexto(datos.exportadoEn) ? datos.exportadoEn : '',
      versionEsquema: datos.versionEsquema,
      sesiones: sesiones.validos,
      conteos: conteos.validos,
      // Los ajustes locales (dispositivo, sesión en curso) se descartan sin contarlos como error.
      ajustes: ajustes.validos,
      respaldos: respaldos.validos,
      borradores: borradores.validos,
      descartados:
        sesiones.descartados + conteos.descartados + respaldos.descartados + borradores.descartados,
    },
  };
}

/**
 * Un conteo que había quedado sin terminar en la copia se importa como conteo terminado de su día.
 * El id sale de la práctica y el momento de inicio, así importar dos veces no lo duplica.
 */
export function borradorComoConteo(borrador: Borrador, dispositivoId: string): Conteo | null {
  const cantidad = borrador.pasos.reduce((a, b) => a + b, 0);
  if (cantidad <= 0) return null;
  return {
    id: `borrador-${borrador.practica}-${borrador.iniciadoEn}`,
    practica: borrador.practica,
    cantidad,
    origen: 'importacion',
    fechaLocal: borrador.fechaLocal,
    creadoEn: borrador.actualizadoEn || borrador.iniciadoEn,
    dispositivoId,
    version: VERSION_ESQUEMA,
  };
}
