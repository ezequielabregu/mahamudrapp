import datos from '../content/sesiones.json';
import type { InfoDelDia } from './calendario';
import type { Preliminar } from './programa';

export type TipoPaso = 'reflexion' | 'meditacion' | 'conteo';
/** Condiciones que un paso puede pedir para mostrarse ese día. */
export type CondicionPaso = 'sin-soporte';

export interface Paso {
  id: string;
  titulo: string;
  tipo?: TipoPaso;
  condicion?: CondicionPaso;
  repeticiones?: number;
  pagina?: number;
  paginaFin?: number;
  detalle?: string;
}

export interface GuiaSesion {
  titulo: string;
  momento: string;
  duracion?: string;
  pasos: Paso[];
}

interface Sesiones {
  shine: GuiaSesion;
  preliminares: Partial<Record<Preliminar, GuiaSesion>>;
}

const sesiones = datos as Sesiones;

export const guiaShine: GuiaSesion = sesiones.shine;

/** Guía de la sesión del preliminar, o undefined si todavía no se cargó su contenido. */
export function guiaPreliminar(preliminar: Preliminar): GuiaSesion | undefined {
  return sesiones.preliminares[preliminar];
}

/** Los pasos que corresponden ese día, en orden. */
export function pasosDelDia(guia: GuiaSesion, info: InfoDelDia): Paso[] {
  return guia.pasos.filter((paso) => cumpleCondicion(paso.condicion, info));
}

function cumpleCondicion(condicion: CondicionPaso | undefined, info: InfoDelDia): boolean {
  if (!condicion) return true;
  if (condicion === 'sin-soporte') return info.soporteId === 'sin-soporte';
  return false;
}

/** "libro, p. 8" o "libro, pp. 72 y 73" */
export function textoPagina(paso: Pick<Paso, 'pagina' | 'paginaFin'>): string | null {
  if (!paso.pagina) return null;
  if (paso.paginaFin && paso.paginaFin !== paso.pagina)
    return `libro, pp. ${paso.pagina} y ${paso.paginaFin}`;
  return `libro, p. ${paso.pagina}`;
}
