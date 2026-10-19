import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Lungta } from './Lungta';

interface Props {
  titulo: string;
  /** Línea corta sobre el título. */
  antetitulo?: string;
  /** Contenido extra dentro de la banda, debajo del título. */
  cabecera?: ReactNode;
  /** Para las subpantallas: botón visible para volver a la sección de la que salen. */
  volver?: { a: string; texto: string };
  children: ReactNode;
}

const IMAGEN_VAJRADHARA = `${import.meta.env.BASE_URL}imagenes/vajradhara.webp`;

/**
 * Estructura común: banda granate con el título y, a la derecha, Vajradhara
 * (escultura del siglo XV, dominio público; ver public/imagenes/LICENCIAS.md).
 */
export function Pantalla({ titulo, antetitulo, cabecera, volver, children }: Props) {
  return (
    <>
      <header className="relative overflow-hidden bg-banda text-sobre-banda bg-[radial-gradient(circle_at_85%_35%,rgb(242_179_61/0.28),transparent_45%)]">
        <Lungta />
        <img
          src={IMAGEN_VAJRADHARA}
          alt=""
          aria-hidden="true"
          width={317}
          height={480}
          className="pointer-events-none absolute right-3 bottom-0 h-[min(80%,7.5rem)] w-auto select-none drop-shadow-[0_6px_14px_rgb(0_0_0/0.35)]"
        />
        <div className={`relative mx-auto max-w-xl pr-[6.25rem] pl-5 pb-7 ${volver ? 'pt-2' : 'pt-6'}`}>
          {volver && (
            <Link
              to={volver.a}
              className="-ml-1 inline-flex min-h-[3rem] items-center gap-2 px-1 font-semibold text-oro-claro"
            >
              <span aria-hidden="true">←</span>
              {volver.texto}
            </Link>
          )}
          {antetitulo && <p className="font-semibold text-oro-claro">{antetitulo}</p>}
          <h1 className="text-[2.1rem] leading-tight font-semibold">{titulo}</h1>
          {cabecera}
        </div>
      </header>
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5 pb-32">{children}</div>
    </>
  );
}
