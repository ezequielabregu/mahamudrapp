import { metaDiariaSugerida, type InfoDelDia } from './calendario';
import { sumarConteos, type MovimientoConteo } from './conteos';
import { diasEntre, sumarDias } from './fechas';
import type { Preliminar } from './programa';

export interface SesionResumible {
  tipo: 'shine' | 'preliminar';
  fechaLocal: string;
  duracionSeg: number;
}

export interface ResumenDelDia {
  shine: { sesiones: number; segundos: number };
  preliminar: {
    practica: Preliminar;
    hoy: number;
    trimestre: number;
    metaTrimestre: number;
    metaDiaria: number | null;
  };
  chenresi: { hoy: number; anio: number; metaAnio: number };
}

/** Estado del día a partir de los registros del año de práctica en curso. */
export function resumirDia(
  info: InfoDelDia,
  sesiones: readonly SesionResumible[],
  conteos: readonly MovimientoConteo[],
  metas: { preliminarTrimestre: number; chenresiAnual: number },
): ResumenDelDia {
  const deHoy = sesiones.filter((s) => s.tipo === 'shine' && s.fechaLocal === info.fecha);
  const manana = sumarDias(info.fecha, 1);
  const practica = info.preliminar;

  return {
    shine: {
      sesiones: deHoy.length,
      segundos: deHoy.reduce((total, s) => total + s.duracionSeg, 0),
    },
    preliminar: {
      practica,
      hoy: sumarConteos(conteos, { practica, desde: info.fecha, hasta: manana }),
      trimestre: sumarConteos(conteos, { practica, desde: info.inicioTrimestre, hasta: info.finTrimestre }),
      metaTrimestre: metas.preliminarTrimestre,
      metaDiaria: metaDiariaSugerida(metas.preliminarTrimestre, info.diasDelTrimestre),
    },
    chenresi: {
      hoy: sumarConteos(conteos, { practica: 'chenresi', desde: info.fecha, hasta: manana }),
      anio: sumarConteos(conteos, { practica: 'chenresi', desde: info.inicioAnio, hasta: info.finAnio }),
      metaAnio: metas.chenresiAnual,
    },
  };
}

export const DIAS_PARA_RECORDAR_RESPALDO = 7;

/** Hay que recordar la copia si hay registros y nunca se hizo una, o pasaron más de 7 días. */
export function debeRecordarRespaldo(
  ultimaCopia: string | undefined,
  hoy: string,
  hayRegistros: boolean,
): boolean {
  if (!hayRegistros) return false;
  if (!ultimaCopia) return true;
  return diasEntre(ultimaCopia, hoy) > DIAS_PARA_RECORDAR_RESPALDO;
}
