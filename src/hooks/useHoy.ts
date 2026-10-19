import { useEffect, useState } from 'react';
import { fechaLocalDe } from '../domain/fechas';

/** Fecha local de hoy. Se actualiza a medianoche y al volver a la app. */
export function useHoy(): string {
  const [hoy, setHoy] = useState(() => fechaLocalDe(new Date()));

  useEffect(() => {
    const actualizar = () => setHoy(fechaLocalDe(new Date()));
    const ahora = new Date();
    const medianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 5);
    const temporizador = setTimeout(actualizar, medianoche.getTime() - ahora.getTime());
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      clearTimeout(temporizador);
      document.removeEventListener('visibilitychange', actualizar);
    };
  }, [hoy]);

  return hoy;
}
