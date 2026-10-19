import {
  PRACTICAS,
  type CompromisoId,
  type Nivel,
  type NumeroNivel,
  type Practica,
  type PracticaYidam,
  type Programa,
} from './programa';

export interface Metas {
  /** Meta del preliminar del trimestre. 0 = sin meta; null = no forma parte del compromiso. */
  preliminarTrimestre: number | null;
  /** Meta anual de Chenresi. null = optativo en este nivel. */
  chenresiAnual: number | null;
  /** Mantras del yidam, acumulados a lo largo de los años del nivel. */
  yidam: { practica: PracticaYidam; meta: number } | null;
}

export function datosDelNivel(numero: NumeroNivel, programa: Programa): Nivel {
  const nivel = programa.niveles.find((n) => n.numero === numero);
  if (!nivel) throw new Error(`Falta el nivel ${numero} en el programa`);
  return nivel;
}

/** Metas según el nivel y, en el nivel 1, según el compromiso elegido. */
export function metasDelNivel(numero: NumeroNivel, compromiso: CompromisoId, programa: Programa): Metas {
  const nivel = datosDelNivel(numero, programa);
  const preliminar = nivel.usaCompromiso
    ? (programa.compromisos.find((c) => c.id === compromiso)?.metaPreliminarTrimestre ?? 0)
    : nivel.metaPreliminarTrimestre;
  return {
    preliminarTrimestre: nivel.sinPreliminares ? null : preliminar,
    chenresiAnual: nivel.metaChenresiAnual,
    yidam: nivel.yidam ?? null,
  };
}

/** Prácticas que se pueden registrar en ese nivel: preliminares, Chenresi y el yidam del nivel. */
export function practicasDelNivel(numero: NumeroNivel, programa: Programa): Practica[] {
  const yidam = datosDelNivel(numero, programa).yidam?.practica;
  return PRACTICAS.filter((p) => !p.startsWith('yidam-') || p === yidam);
}
