import { useId, type ReactNode } from 'react';

interface Props {
  titulo: string;
  /** Para poder saltar a la sección (por ejemplo, "Ir a los números"). */
  id?: string;
  children: ReactNode;
}

/**
 * Agrupa tarjetas bajo un rótulo discreto: texto dorado en mayúsculas y una línea fina, fuera de
 * las tarjetas. El rótulo queda fijo arriba mientras se lee su sección, y lo reemplaza el de la
 * sección siguiente. Separa sin agregar color ni fondos.
 */
export function GrupoSeccion({ titulo, id, children }: Props) {
  const idTitulo = useId();
  return (
    <section id={id} aria-labelledby={idTitulo} className="scroll-mt-2 space-y-4 pt-5 first:pt-0">
      <div className="sticky top-[env(safe-area-inset-top)] z-[15] -mx-4 bg-fondo/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <h2
            id={idTitulo}
            className="font-sans text-[min(1rem,4.4vw)] font-semibold tracking-[0.08em] whitespace-nowrap text-oro uppercase"
          >
            {titulo}
          </h2>
          <span aria-hidden="true" className="h-px flex-1 bg-borde" />
        </div>
      </div>
      {children}
    </section>
  );
}
