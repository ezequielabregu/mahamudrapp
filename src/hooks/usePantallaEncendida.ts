import { useEffect, useState } from 'react';

/**
 * Mantiene la pantalla encendida mientras el componente está montado (Screen Wake Lock API).
 * El navegador suelta el bloqueo al pasar a segundo plano, así que se pide de nuevo al volver.
 * Devuelve false si el navegador no lo permite, para poder avisar.
 */
export function usePantallaEncendida(): boolean {
  const [disponible, setDisponible] = useState(() => 'wakeLock' in navigator);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let bloqueo: WakeLockSentinel | null = null;
    let activo = true;

    const pedir = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const nuevo = await navigator.wakeLock.request('screen');
        if (activo) bloqueo = nuevo;
        else void nuevo.release();
      } catch {
        if (activo) setDisponible(false);
      }
    };

    void pedir();
    document.addEventListener('visibilitychange', pedir);
    return () => {
      activo = false;
      document.removeEventListener('visibilitychange', pedir);
      void bloqueo?.release();
    };
  }, []);

  return disponible;
}
