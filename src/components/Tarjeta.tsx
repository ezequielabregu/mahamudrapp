import type { ReactNode } from 'react';
import { claseTarjeta } from './estilos';

interface Props {
  titulo: string;
  antetitulo?: string;
  subtitulo?: string;
  estado?: ReactNode;
  /** Dentro de un GrupoSeccion (que ya tiene su h2), el título de la tarjeta es h3. */
  nivel?: 2 | 3;
  children?: ReactNode;
}

/** Bloque principal de una pantalla, con título en serif y un estado opcional a la derecha. */
export function Tarjeta({ titulo, antetitulo, subtitulo, estado, nivel = 2, children }: Props) {
  const Titulo = nivel === 3 ? 'h3' : 'h2';
  return (
    <section className={`${claseTarjeta} p-5`}>
      {antetitulo && <p className="mb-1 font-semibold tracking-[0.06em] text-oro uppercase">{antetitulo}</p>}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Titulo className="text-[1.6rem] leading-tight font-semibold">{titulo}</Titulo>
        {estado}
      </div>
      {subtitulo && <p className="mt-1 text-tenue">{subtitulo}</p>}
      {children && <div className="mt-5 space-y-5">{children}</div>}
    </section>
  );
}
