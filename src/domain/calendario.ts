import { diaDeSemana, diasEntre, sumarMeses } from './fechas';
import {
  NOMBRES_DIA,
  type Guia,
  type NombreDia,
  type NumeroTrimestre,
  type Preliminar,
  type Programa,
} from './programa';

export interface InfoDelDia {
  fecha: string;
  /** 1 = primer año de práctica desde la fecha de inicio. */
  anioPractica: number;
  inicioAnio: string;
  /** Exclusivo: primer día del año siguiente. */
  finAnio: string;
  trimestre: NumeroTrimestre;
  inicioTrimestre: string;
  /** Exclusivo: primer día del trimestre siguiente. */
  finTrimestre: string;
  diaDelTrimestre: number;
  diasDelTrimestre: number;
  diaSemana: number;
  nombreDia: NombreDia;
  preliminar: Preliminar;
  reflexionId: string;
  reflexion: Guia;
  soporteId: string;
  soporte: Guia;
}

/** Qué toca en una fecha. Devuelve null si la fecha es anterior al inicio del programa. */
export function infoDelDia(fecha: string, fechaInicio: string, programa: Programa): InfoDelDia | null {
  if (fecha < fechaInicio) return null;

  const meses = programa.mesesPorTrimestre;
  const mesesPorAnio = meses * 4;

  // Estimación por días y ajuste fino, para no recorrer año por año.
  let anio = Math.max(0, Math.floor(diasEntre(fechaInicio, fecha) / 366));
  while (sumarMeses(fechaInicio, (anio + 1) * mesesPorAnio) <= fecha) anio++;

  let indice = 0;
  while (indice < 3 && sumarMeses(fechaInicio, anio * mesesPorAnio + (indice + 1) * meses) <= fecha) {
    indice++;
  }

  const inicioTrimestre = sumarMeses(fechaInicio, anio * mesesPorAnio + indice * meses);
  const finTrimestre = sumarMeses(fechaInicio, anio * mesesPorAnio + (indice + 1) * meses);
  const trimestre = programa.trimestres[indice];
  if (!trimestre) throw new Error(`Falta el trimestre ${indice + 1} en el programa`);

  const diaSemana = diaDeSemana(fecha);
  const nombreDia = NOMBRES_DIA[diaSemana] as NombreDia;
  const reflexionId = programa.reflexionesPorDia[nombreDia];
  const soporteId = trimestre.soportes[nombreDia];
  const reflexion = programa.reflexiones[reflexionId];
  const soporte = programa.soportes[soporteId];
  if (!reflexion || !soporte) throw new Error(`Programa incompleto para el ${nombreDia}`);

  return {
    fecha,
    anioPractica: anio + 1,
    inicioAnio: sumarMeses(fechaInicio, anio * mesesPorAnio),
    finAnio: sumarMeses(fechaInicio, (anio + 1) * mesesPorAnio),
    trimestre: trimestre.numero,
    inicioTrimestre,
    finTrimestre,
    diaDelTrimestre: diasEntre(inicioTrimestre, fecha) + 1,
    diasDelTrimestre: diasEntre(inicioTrimestre, finTrimestre),
    diaSemana,
    nombreDia,
    preliminar: trimestre.preliminar,
    reflexionId,
    reflexion,
    soporteId,
    soporte,
  };
}

/** Meta diaria sugerida para el preliminar: meta del trimestre repartida en sus días. */
export function metaDiariaSugerida(metaTrimestre: number, diasDelTrimestre: number): number | null {
  if (metaTrimestre <= 0 || diasDelTrimestre <= 0) return null;
  return Math.ceil(metaTrimestre / diasDelTrimestre);
}
