import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Lungta } from './Lungta';

interface Props {
  titulo: string;
  /** Línea corta sobre el título. En las subpantallas la ocupa el botón para volver. */
  antetitulo?: string;
  /** Para las subpantallas: botón visible para volver a la sección de la que salen. */
  volver?: { a: string; texto: string };
  /** Avance opcional, dibujado como una línea fina en el borde inferior de la banda. */
  progreso?: { valor: number; maximo: number; etiqueta: string };
  children: ReactNode;
}

const IMAGEN_VAJRADHARA = `${import.meta.env.BASE_URL}imagenes/vajradhara.webp`;

/**
 * Estructura común: banda granate de alto fijo (igual en todas las pantallas) con una línea
 * chica, el título y Vajradhara a la derecha (escultura del siglo XV, dominio público; ver
 * public/imagenes/LICENCIAS.md). Lo demás va en el contenido, nunca en la banda.
 */
export function Pantalla({ titulo, antetitulo, volver, progreso, children }: Props) {
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
        <div className="relative mx-auto flex h-[5.75rem] max-w-xl flex-col justify-end pr-[5.5rem] pb-3 pl-5">
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
        {progreso && (
          <div
            role="progressbar"
            aria-label={progreso.etiqueta}
            aria-valuemin={0}
            aria-valuemax={progreso.maximo}
            aria-valuenow={progreso.valor}
            className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10"
          >
            <div
              className="h-full bg-oro-claro"
              style={{ width: `${Math.min(100, (progreso.valor / progreso.maximo) * 100)}%` }}
            />
          </div>
        )}
      </header>
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5 pb-32">{children}</div>
    </>
  );
}
