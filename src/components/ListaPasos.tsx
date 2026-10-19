import type { InfoDelDia } from '../domain/calendario';
import type { Guia } from '../domain/programa';
import { textoPagina, type Paso } from '../domain/sesiones';

interface Props {
  pasos: Paso[];
  info: InfoDelDia;
}

/** Los pasos de una sesión en orden, como recordatorio. Lo que cambia según el día va resaltado. */
export function ListaPasos({ pasos, info }: Props) {
  return (
    <ol className="relative">
      {pasos.map((paso, i) => (
        <li key={paso.id} className="relative flex gap-4 pb-5 last:pb-0">
          {i < pasos.length - 1 && (
            <span aria-hidden="true" className="absolute top-10 bottom-1 left-[1.1rem] w-px bg-borde" />
          )}
          <span
            aria-hidden="true"
            className="z-10 flex size-[2.2rem] shrink-0 items-center justify-center rounded-full border-2 border-oro bg-superficie font-serif font-semibold text-oro"
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-semibold">{paso.titulo}</p>
            <Referencia paso={paso} />
            {paso.tipo === 'reflexion' && <DelDia etiqueta="Hoy" guia={info.reflexion} />}
            {paso.tipo === 'meditacion' && <DelDia etiqueta="Soporte de hoy" guia={info.soporte} />}
            {paso.detalle && <p className="text-tenue">{paso.detalle}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Referencia({ paso }: { paso: Paso }) {
  const partes = [paso.repeticiones ? `${paso.repeticiones} veces` : null, textoPagina(paso)].filter(Boolean);
  if (partes.length === 0) return null;
  return <p className="text-oro">{partes.join(' · ')}</p>;
}

function DelDia({ etiqueta, guia }: { etiqueta: string; guia: Guia }) {
  return (
    <div className="my-2 rounded-2xl bg-resalte px-4 py-3">
      <p className="text-tenue">{etiqueta}</p>
      <p className="font-serif text-lg leading-snug font-semibold">{guia.titulo}</p>
      {guia.pagina && <p className="text-oro">{textoPagina(guia)}</p>}
      {guia.nota && <p className="mt-1 text-tenue">{guia.nota}</p>}
    </div>
  );
}
