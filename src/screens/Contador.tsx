import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { sonarToque, vibrarSuave } from '../audio/toque';
import { Lungta } from '../components/Lungta';
import { repositorio, totalBorrador } from '../db/repositorio';
import { formatearNumero } from '../domain/formato';
import { esPractica, programa, type Practica } from '../domain/programa';
import { usePantallaEncendida } from '../hooks/usePantallaEncendida';
import { usePreferencias } from '../hooks/usePreferencias';

export function Contador() {
  const { practica } = useParams();
  if (!esPractica(practica)) return <Navigate to="/" replace />;
  return <PantallaContador practica={practica} />;
}

function PantallaContador({ practica }: { practica: Practica }) {
  const navigate = useNavigate();
  const prefs = usePreferencias();
  const pantallaEncendida = usePantallaEncendida();
  const borrador = useLiveQuery(() => repositorio.borrador(practica), [practica]);
  const [error, setError] = useState<string | null>(null);
  const datos = programa.practicas[practica];
  const total = totalBorrador(borrador);

  async function sumar(cantidad: number) {
    if (prefs?.sonidoContador !== false) sonarToque();
    vibrarSuave();
    try {
      await repositorio.sumarAlBorrador(practica, cantidad);
      setError(null);
    } catch {
      setError('No se pudo anotar el último toque. Probá de nuevo.');
    }
  }

  async function terminar() {
    try {
      const guardado = await repositorio.guardarBorrador(practica);
      const mensaje = guardado > 0 ? `Guardado: ${formatearNumero(guardado)} ${datos.unidad}.` : undefined;
      navigate('/', { state: { mensaje } });
    } catch {
      setError('No se pudo guardar. Tu conteo sigue anotado: probá de nuevo.');
    }
  }

  // En esta pantalla los tamaños tienen tope según el ancho del teléfono: con letra muy grande,
  // el botón grande tiene que seguir siendo lo más grande de la pantalla.
  const claseChico =
    'inline-flex min-h-[max(48px,min(3rem,13vw))] min-w-0 items-center justify-center rounded-full border border-borde px-1 ' +
    'text-[min(1rem,4.2vw)] font-semibold whitespace-nowrap text-tenue active:bg-resalte ' +
    'disabled:opacity-40';

  // Dos zonas: arriba, el control (Terminar, deshacer y sumas rápidas, más chicos); abajo, separado,
  // el botón grande hasta el borde de la pantalla. Así, durante las postraciones, un toque a ciegas
  // siempre cae en el botón grande y nunca en otro.
  return (
    <div className="tema-practica flex h-dvh flex-col bg-fondo pt-[env(safe-area-inset-top)] text-tinta">
      <Lungta />
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <h1 className="truncate text-[min(1.6rem,7vw)] leading-tight font-semibold">{datos.corto}</h1>

        {/* Una sola fila de control: Deshacer y Terminar (relleno y más ancho). Las malas o los
            totales contados aparte se cargan con "Registrar sin contador", desde Hoy. */}
        <div className="mt-3 grid grid-cols-[1fr_2fr] gap-3">
          <button
            type="button"
            className={claseChico}
            disabled={!borrador || borrador.pasos.length === 0}
            onClick={() => repositorio.deshacerEnBorrador(practica)}
          >
            Deshacer
          </button>
          <button
            type="button"
            className="inline-flex min-h-[max(48px,min(3rem,13vw))] min-w-0 items-center justify-center rounded-full bg-acento px-2 text-[min(1.1rem,4.6vw)] font-semibold whitespace-nowrap text-sobre-acento active:brightness-110"
            onClick={terminar}
          >
            Terminar
          </button>
        </div>

        {!pantallaEncendida && (
          <p className="mt-2 text-tenue">
            Este navegador no puede mantener la pantalla encendida: puede apagarse sola.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 font-semibold">
            {error}
          </p>
        )}

        <p aria-live="polite" className="sr-only">
          Llevás {formatearNumero(total)}
        </p>
        <button
          type="button"
          aria-label={`Sumar 1. Llevás ${formatearNumero(total)}.`}
          onClick={() => sumar(1)}
          className="mt-8 flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] border border-borde bg-superficie bg-[radial-gradient(circle_at_50%_45%,rgb(234_169_68/0.18),transparent_62%)] active:bg-resalte"
        >
          <span className="font-serif text-[clamp(5rem,26vw,8rem)] leading-none font-semibold text-oro tabular-nums">
            {formatearNumero(total)}
          </span>
          <span className="text-[min(1.25rem,5.5vw)] font-semibold text-tenue">Tocá para sumar 1</span>
        </button>
      </div>
    </div>
  );
}
