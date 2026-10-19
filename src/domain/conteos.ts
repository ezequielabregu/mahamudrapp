import type { Practica } from './programa';

export interface MovimientoConteo {
  practica: Practica;
  cantidad: number;
  fechaLocal: string;
}

export interface FiltroConteo {
  practica?: Practica;
  /** Inclusivo. */
  desde?: string;
  /** Exclusivo. */
  hasta?: string;
}

/** Suma los conteos que cumplen el filtro. Las correcciones son cantidades negativas. */
export function sumarConteos(conteos: readonly MovimientoConteo[], filtro: FiltroConteo = {}): number {
  let total = 0;
  for (const c of conteos) {
    if (filtro.practica && c.practica !== filtro.practica) continue;
    if (filtro.desde && c.fechaLocal < filtro.desde) continue;
    if (filtro.hasta && c.fechaLocal >= filtro.hasta) continue;
    total += c.cantidad;
  }
  return total;
}

/** Valida una cantidad a registrar: entera, distinta de cero y razonable. */
export function esCantidadValida(cantidad: number): boolean {
  return Number.isInteger(cantidad) && cantidad !== 0 && Math.abs(cantidad) <= 1_000_000;
}
