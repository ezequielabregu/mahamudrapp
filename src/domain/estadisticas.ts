import { sumarConteos, type MovimientoConteo } from './conteos';
import { diaDeSemana, diasEntre, sumarDias, sumarMeses } from './fechas';
import type { Preliminar, PracticaYidam } from './programa';
import type { SesionResumible } from './resumen';

const PRELIMINARES: Preliminar[] = ['postraciones', 'vajrasattva', 'mandala', 'guruyoga'];
const YIDAMS: PracticaYidam[] = ['yidam-exterior', 'yidam-interior', 'yidam-secreto'];

/** Días (fecha local) con al menos una sesión de Shiné. */
export function diasConShine(sesiones: readonly SesionResumible[]): Set<string> {
  return new Set(sesiones.filter((s) => s.tipo === 'shine').map((s) => s.fechaLocal));
}

export interface Regularidad {
  dias: number;
  practicados: number;
  /** Entero de 0 a 100. */
  porcentaje: number;
}

/**
 * Regularidad del carnet: días con Shiné sobre días del período (ambos extremos inclusive).
 * Equivale a la fórmula de la Lama: (días del año menos días sin practicar) / días del año.
 */
export function regularidad(sesiones: readonly SesionResumible[], desde: string, hasta: string): Regularidad {
  const dias = Math.max(0, diasEntre(desde, hasta) + 1);
  let practicados = 0;
  for (const dia of diasConShine(sesiones)) if (dia >= desde && dia <= hasta) practicados++;
  return { dias, practicados, porcentaje: dias ? Math.round((practicados / dias) * 100) : 0 };
}

/**
 * Días seguidos con Shiné. La racha actual cuenta hasta hoy; si hoy todavía no hubo
 * sesión, cuenta hasta ayer (el día no terminó).
 */
export function rachas(
  sesiones: readonly SesionResumible[],
  hoy: string,
): { actual: number; maxima: number } {
  const dias = diasConShine(sesiones);
  let actual = 0;
  let dia = dias.has(hoy) ? hoy : sumarDias(hoy, -1);
  while (dias.has(dia)) {
    actual++;
    dia = sumarDias(dia, -1);
  }

  let maxima = 0;
  let corrida = 0;
  let anterior: string | null = null;
  for (const d of [...dias].filter((d) => d <= hoy).sort()) {
    corrida = anterior !== null && diasEntre(anterior, d) === 1 ? corrida + 1 : 1;
    maxima = Math.max(maxima, corrida);
    anterior = d;
  }
  return { actual, maxima };
}

/** Lunes de la semana de una fecha. */
export function inicioDeSemana(fecha: string): string {
  return sumarDias(fecha, -((diaDeSemana(fecha) + 6) % 7));
}

/** Minutos de Shiné por día, entre dos fechas (fin exclusivo). */
export function minutosPorDia(
  sesiones: readonly SesionResumible[],
  desde: string,
  hasta: string,
): Map<string, number> {
  const minutos = new Map<string, number>();
  for (const s of sesiones) {
    if (s.tipo !== 'shine' || s.fechaLocal < desde || s.fechaLocal >= hasta) continue;
    minutos.set(s.fechaLocal, (minutos.get(s.fechaLocal) ?? 0) + s.duracionSeg / 60);
  }
  return minutos;
}

/** Minutos de Shiné de las últimas semanas (de lunes a domingo), la actual incluida, de la más vieja a la más nueva. */
export function minutosPorSemana(
  sesiones: readonly SesionResumible[],
  hoy: string,
  semanas: number,
): { inicio: string; minutos: number }[] {
  const ultima = inicioDeSemana(hoy);
  return Array.from({ length: semanas }, (_, i) => {
    const inicio = sumarDias(ultima, -7 * (semanas - 1 - i));
    const porDia = minutosPorDia(sesiones, inicio, sumarDias(inicio, 7));
    const total = [...porDia.values()].reduce((a, b) => a + b, 0);
    return { inicio, minutos: Math.round(total) };
  });
}

export interface Proyeccion {
  /** Promedio por día en lo que va del período. */
  ritmoDiario: number;
  /** Total esperado al final del período si se sigue a este ritmo. */
  proyectado: number;
  /** Cuánto haría falta por día, desde hoy, para llegar a la meta. null si no hay meta o ya se llegó. */
  faltanPorDia: number | null;
}

/** Proyección hacia la meta de un período, sabiendo qué día del período es hoy (1 = el primero). */
export function proyeccion(total: number, meta: number, diaActual: number, diasTotales: number): Proyeccion {
  const ritmoDiario = diaActual > 0 ? total / diaActual : 0;
  const restantes = Math.max(1, diasTotales - diaActual + 1);
  const falta = meta - total;
  return {
    ritmoDiario,
    proyectado: Math.round(ritmoDiario * diasTotales),
    faltanPorDia: meta > 0 && falta > 0 ? Math.ceil(falta / restantes) : null,
  };
}

export interface FilaCarnet {
  anio: number;
  /** "2026-27", como en el carnet. */
  etiqueta: string;
  enCurso: boolean;
  /** Regularidad de meditación del año, en %; en el año en curso, sobre los días transcurridos. */
  meditacion: number;
  /** Chenresi: lo hecho en ese año. */
  chenresi: number;
  /** Preliminares: acumulado de todos los años hasta el final de ese. */
  preliminares: Record<Preliminar, number>;
  /** Yidam: acumulado, igual que los preliminares. */
  yidam: Record<PracticaYidam, number>;
}

/** El "recuento de las prácticas" del carnet: una fila por año de práctica, hasta el año en curso. */
export function resumenCarnet(
  sesiones: readonly SesionResumible[],
  conteos: readonly MovimientoConteo[],
  fechaInicio: string,
  hoy: string,
): FilaCarnet[] {
  const filas: FilaCarnet[] = [];
  for (let anio = 1; ; anio++) {
    const inicio = sumarMeses(fechaInicio, 12 * (anio - 1));
    if (inicio > hoy) break;
    const fin = sumarMeses(fechaInicio, 12 * anio);
    const enCurso = hoy < fin;
    const ultimoDia = enCurso ? hoy : sumarDias(fin, -1);
    const acumulado = <P extends string>(practicas: P[]) =>
      Object.fromEntries(
        practicas.map((p) => [p, sumarConteos(conteos, { practica: p as never, hasta: fin })]),
      ) as Record<P, number>;

    filas.push({
      anio,
      etiqueta: `${inicio.slice(0, 4)}-${fin.slice(2, 4)}`,
      enCurso,
      meditacion: regularidad(sesiones, inicio, ultimoDia).porcentaje,
      chenresi: sumarConteos(conteos, { practica: 'chenresi', desde: inicio, hasta: fin }),
      preliminares: acumulado(PRELIMINARES),
      yidam: acumulado(YIDAMS),
    });
  }
  return filas;
}
