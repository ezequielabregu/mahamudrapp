import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  estado?: ReactNode;
  children: ReactNode;
}

/** Bloque de la pantalla con un título y, opcionalmente, un estado a la derecha. */
export function Seccion({ titulo, estado, children }: Props) {
  return (
    <section className="rounded-2xl border border-borde bg-superficie p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {estado && <p className="text-tenue">{estado}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
