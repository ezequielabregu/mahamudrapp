import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { sonarToque, vibrarSuave } from '../audio/toque';
import { clasesBoton } from '../components/estilos';
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

  return (
    <div className="tema-practica flex min-h-dvh flex-col bg-fondo pt-[env(safe-area-inset-top)] pb-[max(1rem,env(safe-area-inset-bottom))] text-tinta">
      <Lungta />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pt-4">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{datos.titulo}</h1>
          <button type="button" className={clasesBoton('secundario', 'w-auto')} onClick={terminar}>
            Terminar
          </button>
        </header>

        <p
          aria-live="polite"
          className="text-center font-serif text-[5.5rem] leading-none font-semibold text-oro tabular-nums"
        >
          <span className="sr-only">Llevás </span>
          {formatearNumero(total)}
        </p>

        <button
          type="button"
          onClick={() => sumar(1)}
          className="min-h-[50dvh] flex-1 rounded-[2rem] border border-borde bg-superficie bg-[radial-gradient(circle_at_50%_45%,rgb(234_169_68/0.18),transparent_62%)] text-2xl font-semibold active:bg-resalte"
        >
          Tocá para sumar 1
        </button>

        {datos.sumasRapidas.length > 0 && (
          <div className="flex gap-3">
            {datos.sumasRapidas.map((s) => (
              <button
                key={s.cantidad}
                type="button"
                className={clasesBoton()}
                onClick={() => sumar(s.cantidad)}
              >
                {s.etiqueta}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className={clasesBoton()}
          disabled={!borrador || borrador.pasos.length === 0}
          onClick={() => repositorio.deshacerEnBorrador(practica)}
        >
          Deshacer el último
        </button>

        {datos.nota && <p className="text-center text-tenue">{datos.nota}</p>}
        {!pantallaEncendida && (
          <p className="text-center text-tenue">
            Este navegador no puede mantener la pantalla encendida: puede apagarse sola.
          </p>
        )}
        {error && (
          <p role="alert" className="text-center font-semibold">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
