import { sumarDias, sumarMeses } from './fechas';
import type { Guia, NombreDia, NumeroTrimestre, Preliminar, Programa } from './programa';

/** Orden y nombres de los días como en el cuadernillo: de lunes a domingo. */
export const DIAS_DEL_CUADERNILLO: { id: NombreDia; nombre: string }[] = [
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' },
  { id: 'domingo', nombre: 'Domingo' },
];

export interface DiaDeLaSemana {
  id: NombreDia;
  nombre: string;
  reflexion: Guia;
  soporte: Guia;
}

export interface SemanaDelTrimestre {
  trimestre: NumeroTrimestre;
  preliminar: Preliminar;
  dias: DiaDeLaSemana[];
}

/** La semana tipo de un trimestre, como la presenta el cuadernillo. */
export function semanaDelTrimestre(numero: NumeroTrimestre, programa: Programa): SemanaDelTrimestre {
  const trimestre = programa.trimestres.find((t) => t.numero === numero);
  if (!trimestre) throw new Error(`Falta el trimestre ${numero} en el programa`);
  return {
    trimestre: numero,
    preliminar: trimestre.preliminar,
    dias: DIAS_DEL_CUADERNILLO.map(({ id, nombre }) => {
      const reflexion = programa.reflexiones[programa.reflexionesPorDia[id]];
      const soporte = programa.soportes[trimestre.soportes[id]];
      if (!reflexion || !soporte) throw new Error(`Programa incompleto para el ${nombre}`);
      return { id, nombre, reflexion, soporte };
    }),
  };
}

/** Primer y último día de un trimestre dentro de un año de práctica (ambos inclusive). */
export function rangoDelTrimestre(
  inicioAnio: string,
  numero: NumeroTrimestre,
  programa: Programa,
): { desde: string; hasta: string } {
  const meses = programa.mesesPorTrimestre;
  return {
    desde: sumarMeses(inicioAnio, (numero - 1) * meses),
    hasta: sumarDias(sumarMeses(inicioAnio, numero * meses), -1),
  };
}
