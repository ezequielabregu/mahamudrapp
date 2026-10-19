import { useId, useState } from 'react';
import type { InfoDelDia } from '../domain/calendario';
import type { Guia } from '../domain/programa';
import { explicacionDelPaso, textoPagina, type Paso } from '../domain/sesiones';

interface Props {
  pasos: Paso[];
  info: InfoDelDia;
}

/**
 * Los pasos de una sesión en orden, como recordatorio: título, veces y página del libro.
 * Lo que cambia según el día va resaltado. La explicación queda detrás del botón "i".
 */
export function ListaPasos({ pasos, info }: Props) {
  return (
    <ol className="relative">
      {pasos.map((paso, i) => (
        <PasoDeLaLista key={paso.id} paso={paso} numero={i + 1} ultimo={i === pasos.length - 1} info={info} />
      ))}
    </ol>
  );
}

function PasoDeLaLista(props: { paso: Paso; numero: number; ultimo: boolean; info: InfoDelDia }) {
  const { paso, numero, ultimo, info } = props;
  const [abierta, setAbierta] = useState(false);
  const idExplicacion = useId();
  const explicacion = explicacionDelPaso(paso, info);

  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!ultimo && (
        <span aria-hidden="true" className="absolute top-10 bottom-1 left-[1.1rem] w-px bg-borde" />
      )}
      <span
        aria-hidden="true"
        className="z-10 flex size-[2.2rem] shrink-0 items-center justify-center rounded-full border-2 border-oro bg-superficie font-serif font-semibold text-oro"
      >
        {numero}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{paso.titulo}</p>
            <Referencia paso={paso} />
          </div>
          {explicacion.length > 0 && (
            <button
              type="button"
              aria-expanded={abierta}
              aria-controls={idExplicacion}
              aria-label={`${abierta ? 'Ocultar' : 'Ver'} la explicación de ${paso.titulo}`}
              onClick={() => setAbierta((a) => !a)}
              className="-mt-2.5 -mr-2 flex size-[3rem] shrink-0 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={
                  'flex size-[1.8rem] items-center justify-center rounded-full border-2 font-serif font-semibold italic ' +
                  (abierta ? 'border-oro bg-oro text-superficie' : 'border-oro/50 text-oro')
                }
              >
                i
              </span>
            </button>
          )}
        </div>

        {paso.tipo === 'reflexion' && <DelDia etiqueta="Hoy" guia={info.reflexion} />}
        {paso.tipo === 'meditacion' && <DelDia etiqueta="Soporte de hoy" guia={info.soporte} />}

        {abierta && (
          <div id={idExplicacion} className="mt-2 space-y-1 border-l-2 border-oro/50 pl-3 text-tenue">
            {explicacion.map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function Referencia({ paso }: { paso: Paso }) {
  const partes = [paso.repeticiones ? `${paso.repeticiones} veces` : null, textoPagina(paso)].filter(Boolean);
  if (partes.length === 0) return null;
  return <p className="text-oro">{partes.join(' · ')}</p>;
}

function DelDia({ etiqueta, guia }: { etiqueta: string; guia: Guia }) {
  return (
    <div className="mt-2 rounded-2xl bg-resalte px-4 py-3">
      <p className="text-tenue">{etiqueta}</p>
      <p className="font-serif text-lg leading-snug font-semibold">{guia.titulo}</p>
      {guia.pagina && <p className="text-oro">{textoPagina(guia)}</p>}
    </div>
  );
}
