// Fechas locales como texto 'YYYY-MM-DD'. Toda la aritmética se hace en UTC
// sobre esos textos, así los cambios de horario no corren ningún día.

const PATRON = /^(\d{4})-(\d{2})-(\d{2})$/;

export function fechaLocalDe(d: Date): string {
  return componer(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function esFechaValida(fecha: string): boolean {
  const m = PATRON.exec(fecha);
  if (!m) return false;
  const [a, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(a, mes);
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aUtc(hasta) - aUtc(desde)) / 86_400_000);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(aUtc(fecha) + dias * 86_400_000);
  return componer(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Suma meses conservando el día; si el mes destino es más corto, usa su último día. */
export function sumarMeses(fecha: string, meses: number): string {
  const { anio, mes, dia } = partes(fecha);
  const indice = anio * 12 + (mes - 1) + meses;
  const nuevoAnio = Math.floor(indice / 12);
  const nuevoMes = (indice % 12) + 1;
  return componer(nuevoAnio, nuevoMes, Math.min(dia, diasDelMes(nuevoAnio, nuevoMes)));
}

/** 0 = domingo, como Date.getDay(). */
export function diaDeSemana(fecha: string): number {
  return new Date(aUtc(fecha)).getUTCDay();
}

/** Fecha local a mediodía, para mostrarla con Intl sin riesgo de saltar de día. */
export function aDateLocal(fecha: string): Date {
  const { anio, mes, dia } = partes(fecha);
  return new Date(anio, mes - 1, dia, 12);
}

function partes(fecha: string): { anio: number; mes: number; dia: number } {
  const m = PATRON.exec(fecha);
  if (!m) throw new Error(`Fecha inválida: ${fecha}`);
  return { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

function aUtc(fecha: string): number {
  const { anio, mes, dia } = partes(fecha);
  return Date.UTC(anio, mes - 1, dia);
}

function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

function componer(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
