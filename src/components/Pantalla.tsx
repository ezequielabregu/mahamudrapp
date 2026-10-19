import type { ReactNode } from 'react';
import { Lungta } from './Lungta';

interface Props {
  titulo: string;
  /** Línea corta sobre el título. */
  antetitulo?: string;
  /** Contenido extra dentro de la banda, debajo del título. */
  cabecera?: ReactNode;
  children: ReactNode;
}

/** Estructura común: banda granate con el título y el contenido debajo. */
export function Pantalla({ titulo, antetitulo, cabecera, children }: Props) {
  return (
    <>
      <header className="bg-banda text-sobre-banda bg-[radial-gradient(circle_at_88%_0%,rgb(242_179_61/0.22),transparent_55%)]">
        <Lungta />
        <div className="mx-auto max-w-xl px-5 pt-6 pb-7">
          {antetitulo && <p className="font-semibold text-oro-claro">{antetitulo}</p>}
          <h1 className="text-[2.1rem] leading-tight font-semibold">{titulo}</h1>
          {cabecera}
        </div>
      </header>
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5 pb-32">{children}</div>
    </>
  );
}
