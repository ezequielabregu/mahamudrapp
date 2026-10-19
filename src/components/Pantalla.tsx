import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Lungta } from './Lungta';

interface Props {
  titulo: string;
  /** Línea corta sobre el título. En las subpantallas la ocupa el botón para volver. */
  antetitulo?: string;
  /** Para las subpantallas: botón visible para volver a la sección de la que salen. */
  volver?: { a: string; texto: string };
  /** Elemento chico a la derecha del título (en Hoy, el mandala del año). */
  adorno?: ReactNode;
  children: ReactNode;
}

const IMAGEN_VAJRADHARA = `${import.meta.env.BASE_URL}imagenes/vajradhara.webp`;

/**
 * Estructura común: banda granate de alto fijo (igual en todas las pantallas) con una línea
 * chica, el título y Vajradhara a la derecha (escultura del siglo XV, dominio público; ver
 * public/imagenes/LICENCIAS.md). Lo demás va en el contenido, nunca en la banda.
 */
export function Pantalla({ titulo, antetitulo, volver, adorno, children }: Props) {
  return (
    <>
      <header className="relative overflow-hidden bg-banda text-sobre-banda bg-[radial-gradient(circle_at_88%_40%,rgb(242_179_61/0.28),transparent_45%)]">
        <Lungta />
        <img
          src={IMAGEN_VAJRADHARA}
          alt=""
          aria-hidden="true"
          width={317}
          height={480}
          className="pointer-events-none absolute right-3 bottom-0 h-[5.25rem] w-auto select-none drop-shadow-[0_6px_14px_rgb(0_0_0/0.35)]"
        />
        <div className="relative mx-auto flex h-[5.75rem] max-w-xl items-end gap-3 pr-[5.5rem] pb-3 pl-5">
          <div className="flex min-w-0 flex-1 flex-col">
            {volver ? (
              <Link
                to={volver.a}
                className="-my-3 -ml-1 inline-flex min-h-[3rem] w-fit items-center gap-2 px-1 text-[min(1rem,4.6vw)] font-semibold text-oro-claro"
              >
                <span aria-hidden="true">←</span>
                {volver.texto}
              </Link>
            ) : (
              antetitulo && (
                <p className="truncate text-[min(1rem,4.6vw)] font-semibold text-oro-claro">{antetitulo}</p>
              )
            )}
            <h1 className="truncate text-[min(2rem,8.5vw)] leading-tight font-semibold">{titulo}</h1>
          </div>
          {adorno && <div className="shrink-0">{adorno}</div>}
        </div>
      </header>
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5 pb-32">{children}</div>
    </>
  );
}
