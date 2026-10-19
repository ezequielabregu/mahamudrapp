import { useLiveQuery } from 'dexie-react-hooks';
import { repositorio, type Preferencias } from '../db/repositorio';

/** Preferencias guardadas (con sus valores por defecto). undefined mientras carga. */
export function usePreferencias(): Preferencias | undefined {
  return useLiveQuery(() => repositorio.leerPreferencias(), []);
}
