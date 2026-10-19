import type { Repositorio } from '../db/repositorio';
import { fechaLocalDe } from '../domain/fechas';

export type MetodoCopia = 'compartir' | 'descarga';

/** ¿Este navegador puede enviar archivos con el menú Compartir del sistema? */
export function puedeCompartirArchivos(): boolean {
  if (typeof navigator.canShare !== 'function') return false;
  const prueba = new File(['{}'], 'prueba.json', { type: 'application/json' });
  return navigator.canShare({ files: [prueba] });
}

/**
 * Arma la copia completa (JSON) y la envía o la descarga. Registra la copia en el log
 * solo si se completó. Devuelve null si la persona cerró el menú Compartir sin elegir nada.
 */
export async function hacerCopia(repo: Repositorio, metodo: MetodoCopia): Promise<MetodoCopia | null> {
  const copia = await repo.exportarTodo();
  const nombre = `mahamudra-copia-${fechaLocalDe(new Date())}.json`;
  const archivo = new File([JSON.stringify(copia, null, 2)], nombre, { type: 'application/json' });
  const registros = copia.tablas.sesiones.length + copia.tablas.conteos.length;

  if (metodo === 'compartir') {
    try {
      await navigator.share({ files: [archivo], title: 'Copia de Mahamudra' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null;
      throw error;
    }
  } else {
    descargar(archivo);
  }

  await repo.registrarRespaldo(metodo, registros);
  return metodo;
}

function descargar(archivo: File): void {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = archivo.name;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
