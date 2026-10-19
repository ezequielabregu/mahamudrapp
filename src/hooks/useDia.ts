import { useLiveQuery } from 'dexie-react-hooks';
import { repositorio, type Preferencias } from '../db/repositorio';
import { infoDelDia, type InfoDelDia } from '../domain/calendario';
import { programa } from '../domain/programa';
import { debeRecordarRespaldo, resumirDia, type ResumenDelDia } from '../domain/resumen';

export interface EstadoDelDia {
  info: InfoDelDia | null;
  resumen: ResumenDelDia | null;
  ultimaCopia: string | undefined;
  recordarCopia: boolean;
}

/** Todo lo que la pantalla Hoy necesita, recalculado cuando cambia la base. */
export function useDia(hoy: string, prefs: Preferencias | undefined): EstadoDelDia | undefined {
  return useLiveQuery(async () => {
    if (!prefs) return undefined;
    const info = infoDelDia(hoy, prefs.fechaInicio, programa);
    const [ultima, registros] = await Promise.all([
      repositorio.ultimoRespaldo(),
      repositorio.cantidadDeRegistros(),
    ]);
    const hayRegistros = registros.sesiones + registros.conteos > 0;
    const ultimaCopia = ultima?.fechaLocal;
    const recordarCopia = debeRecordarRespaldo(ultimaCopia, hoy, hayRegistros);
    if (!info) return { info, resumen: null, ultimaCopia, recordarCopia };

    const [sesiones, conteos] = await Promise.all([
      repositorio.sesionesEntre(info.inicioAnio, info.finAnio),
      repositorio.conteosEntre(info.inicioAnio, info.finAnio),
    ]);
    const compromiso = programa.compromisos.find((c) => c.id === prefs.compromiso);
    const resumen = resumirDia(info, sesiones, conteos, {
      preliminarTrimestre: compromiso?.metaPreliminarTrimestre ?? 0,
      chenresiAnual: programa.metaChenresiAnual,
    });
    return { info, resumen, ultimaCopia, recordarCopia };
  }, [hoy, prefs]);
}
