import type { Conteo, OrigenConteo, Sesion, TipoSesion } from '../db/schema';
import { formatearNumero } from './formato';
import { PRACTICAS, type Practica, type Programa } from './programa';

/** Una línea del historial: una sesión o un conteo, tal como se registró. */
export type LineaHistorial =
  | {
      clase: 'sesion';
      id: string;
      creadoEn: string;
      tipo: TipoSesion;
      minutos: number;
      origen: Sesion['origen'];
    }
  | {
      clase: 'conteo';
      id: string;
      creadoEn: string;
      practica: Practica;
      cantidad: number;
      origen: OrigenConteo;
    };

export interface DiaHistorial {
  fecha: string;
  lineas: LineaHistorial[];
}

/** 'todo', solo las sesiones de Shiné, o una práctica que se cuenta. */
export type FiltroHistorial = 'todo' | 'shine' | Practica;

/**
 * Todo lo registrado, agrupado por día: del día más reciente al más viejo y, dentro de cada día,
 * en el orden en que se registró. Solo lee: no cambia ningún registro.
 */
export function historialPorDia(
  sesiones: readonly Sesion[],
  conteos: readonly Conteo[],
  filtro: FiltroHistorial = 'todo',
): DiaHistorial[] {
  const lineas: (LineaHistorial & { fecha: string })[] = [];
  if (filtro === 'todo' || filtro === 'shine') {
    for (const s of sesiones) {
      if (filtro === 'shine' && s.tipo !== 'shine') continue;
      lineas.push({
        clase: 'sesion',
        id: s.id,
        creadoEn: s.creadoEn,
        fecha: s.fechaLocal,
        tipo: s.tipo,
        minutos: Math.round(s.duracionSeg / 60),
        origen: s.origen,
      });
    }
  }
  if (filtro !== 'shine') {
    for (const c of conteos) {
      if (filtro !== 'todo' && c.practica !== filtro) continue;
      lineas.push({
        clase: 'conteo',
        id: c.id,
        creadoEn: c.creadoEn,
        fecha: c.fechaLocal,
        practica: c.practica,
        cantidad: c.cantidad,
        origen: c.origen,
      });
    }
  }
  const porDia = new Map<string, LineaHistorial[]>();
  for (const { fecha, ...linea } of lineas.sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))) {
    const dia = porDia.get(fecha) ?? [];
    dia.push(linea as LineaHistorial);
    porDia.set(fecha, dia);
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, lineasDelDia]) => ({ fecha, lineas: lineasDelDia }));
}

/** Prácticas con algún conteo registrado, en el orden del programa. */
export function practicasConRegistros(conteos: readonly Conteo[]): Practica[] {
  const con = new Set(conteos.map((c) => c.practica));
  return PRACTICAS.filter((p) => con.has(p));
}

/** "1.080 mantras de Vajrasattva", "45 postraciones": la cantidad con el nombre de la práctica. */
export function cantidadConPractica(cantidad: number, practica: Practica, programa: Programa): string {
  const { titulo } = programa.practicas[practica];
  return `${formatearNumero(cantidad)} ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}`;
}

/** Lo contado en un día, por práctica, sin las que suman cero: para el detalle del calendario. */
export function contadoEnElDia(
  conteos: readonly Conteo[],
  fecha: string,
): { practica: Practica; total: number }[] {
  const totales = new Map<Practica, number>();
  for (const c of conteos) {
    if (c.fechaLocal === fecha) totales.set(c.practica, (totales.get(c.practica) ?? 0) + c.cantidad);
  }
  return PRACTICAS.flatMap((p) => {
    const total = totales.get(p) ?? 0;
    return total !== 0 ? [{ practica: p, total }] : [];
  });
}
