import { aDateLocal, diasEntre } from './fechas';

const numeros = new Intl.NumberFormat('es-AR');
const fechaLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

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

export function formatearMinutos(segundos: number): string {
  const minutos = Math.round(segundos / 60);
  return minutos === 1 ? '1 minuto' : `${minutos} minutos`;
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
