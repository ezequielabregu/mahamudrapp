import { aDateLocal, diasEntre } from './fechas';

const numeros = new Intl.NumberFormat('es-AR');
const fechaLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
const soloDia = new Intl.DateTimeFormat('es-AR', { weekday: 'long' });
const diaMes = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });

/** "Domingo" */
export function nombreDelDia(fecha: string): string {
  return mayuscula(soloDia.format(aDateLocal(fecha)));
}

/** "18 de octubre" */
export function formatearDiaYMes(fecha: string): string {
  return diaMes.format(aDateLocal(fecha));
}

export function formatearNumero(n: number): string {
  return numeros.format(n);
}

/** "Sábado 18 de octubre" */
export function formatearFechaLarga(fecha: string): string {
  return mayuscula(fechaLarga.format(aDateLocal(fecha)));
}

/** "18 de octubre de 2026" */
export function formatearFechaCorta(fecha: string): string {
  return fechaCorta.format(aDateLocal(fecha));
}

/** "hoy", "ayer", "hace 3 días" */
export function haceCuanto(fecha: string, hoy: string): string {
  const dias = diasEntre(fecha, hoy);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

/** "1 sesión", "3 sesiones", "1.240 conteos" */
export function contar(n: number, singular: string, plural: string): string {
  return `${formatearNumero(n)} ${n === 1 ? singular : plural}`;
}

export function formatearMinutos(segundos: number): string {
  const minutos = Math.round(segundos / 60);
  return minutos === 1 ? '1 minuto' : `${minutos} minutos`;
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
