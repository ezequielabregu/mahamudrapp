// Temporizador de la sesión de Shiné. Todo se calcula a partir de la marca de inicio y del
// reloj (Date.now()), nunca contando ticks: así no se desfasa aunque el navegador frene la app.

export const MINUTOS_MINIMOS = 1;
export const MINUTOS_MAXIMOS = 180;
/** Por debajo de esto, terminar antes no ofrece guardar la sesión. */
export const SEGUNDOS_MINIMOS_PARA_GUARDAR = 60;

export interface EstadoTemporizador {
  transcurridoSeg: number;
  restanteSeg: number;
  /** De 0 a 1. */
  fraccion: number;
  terminado: boolean;
}

export function estadoTemporizador(
  inicioMs: number,
  duracionSeg: number,
  ahoraMs: number,
): EstadoTemporizador {
  const transcurridoSeg = Math.min(duracionSeg, Math.max(0, Math.floor((ahoraMs - inicioMs) / 1000)));
  return {
    transcurridoSeg,
    restanteSeg: duracionSeg - transcurridoSeg,
    fraccion: duracionSeg > 0 ? transcurridoSeg / duracionSeg : 1,
    terminado: ahoraMs - inicioMs >= duracionSeg * 1000,
  };
}

/** "29:59", "1:05:00" */
export function formatearReloj(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const horas = Math.floor(s / 3600);
  const minutos = Math.floor((s % 3600) / 60);
  const segs = String(s % 60).padStart(2, '0');
  return horas > 0 ? `${horas}:${String(minutos).padStart(2, '0')}:${segs}` : `${minutos}:${segs}`;
}

export function minutosValidos(minutos: number): boolean {
  return Number.isInteger(minutos) && minutos >= MINUTOS_MINIMOS && minutos <= MINUTOS_MAXIMOS;
}
