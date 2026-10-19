import type { Apariencia } from './db/repositorio';

/** Color de la barra del navegador y del sistema: el de la banda de cada tema. */
const COLOR_BARRA = { claro: '#5e1418', oscuro: '#2b1214' } as const;

/**
 * Copia de la apariencia elegida en localStorage, solo para pintar el tema correcto
 * antes de que cargue la base (lo lee el script de index.html). La preferencia real
 * vive en la base; si esta copia falta o falla, se usa el tema oscuro por defecto.
 */
export const CLAVE_TEMA = 'mahamudra-apariencia';

const consultaOscuro = () => window.matchMedia('(prefers-color-scheme: dark)');

function aplicar(apariencia: Apariencia): void {
  const oscuro = apariencia === 'oscura' || (apariencia === 'automatica' && consultaOscuro().matches);
  const tema = oscuro ? 'oscuro' : 'claro';
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema]);
}

/** Aplica la apariencia y, si es automática, la sigue cuando el teléfono cambia de modo. */
export function aplicarApariencia(apariencia: Apariencia): () => void {
  aplicar(apariencia);
  try {
    localStorage.setItem(CLAVE_TEMA, apariencia);
  } catch {
    // Sin almacenamiento del navegador: no importa, la base tiene la preferencia.
  }
  if (apariencia !== 'automatica') return () => {};
  const consulta = consultaOscuro();
  const alCambiar = () => aplicar(apariencia);
  consulta.addEventListener('change', alCambiar);
  return () => consulta.removeEventListener('change', alCambiar);
}
