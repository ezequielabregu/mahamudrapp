import { useSyncExternalStore } from 'react';
import {
  detectarSistema,
  estaInstalada,
  instalar,
  puedeInstalarDirecto,
  suscribirInstalacion,
  type Sistema,
} from '../pwa/instalacion';

export interface EstadoInstalacion {
  sistema: Sistema;
  instalada: boolean;
  puedeInstalarDirecto: boolean;
  instalar: () => Promise<boolean>;
}

export function useInstalacion(): EstadoInstalacion {
  const directo = useSyncExternalStore(suscribirInstalacion, puedeInstalarDirecto);
  return {
    sistema: detectarSistema(),
    instalada: estaInstalada(),
    puedeInstalarDirecto: directo,
    instalar,
  };
}
