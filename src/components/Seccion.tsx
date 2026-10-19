import type { ReactNode } from 'react';
import { claseTarjeta } from './estilos';

interface Props {
  titulo: string;
  estado?: ReactNode;
  children: ReactNode;
}

/** Bloque secundario (formularios, ajustes): título más chico que el de Tarjeta. */
export function Seccion({ titulo, estado, children }: Props) {
  return (
    <section className={`${claseTarjeta} p-5`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-xl font-semibold">{titulo}</h2>
        {estado && <p className="text-tenue">{estado}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
