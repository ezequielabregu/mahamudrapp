import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  agendarCuencoFinal,
  asegurarCuencoFinal,
  audioHabilitado,
  sonarCuencoInicio,
  type CuencoAgendado,
} from '../audio/cuenco';
import { obtenerContexto } from '../audio/contexto';
import { AnilloReloj } from '../components/AnilloReloj';
import { claseCampo, clasesBoton } from '../components/estilos';
import { Lungta } from '../components/Lungta';
import { repositorio, type ShineEnCurso } from '../db/repositorio';
import { infoDelDia } from '../domain/calendario';
import { formatearMinutos } from '../domain/formato';
import { programa } from '../domain/programa';
import { guiaShine, textoPagina } from '../domain/sesiones';
import {
  estadoTemporizador,
  formatearReloj,
  MINUTOS_MAXIMOS,
  MINUTOS_MINIMOS,
  SEGUNDOS_MINIMOS_PARA_GUARDAR,
} from '../domain/temporizador';
import { useHoy } from '../hooks/useHoy';
import { usePantallaEncendida } from '../hooks/usePantallaEncendida';
import { usePreferencias } from '../hooks/usePreferencias';

/** Si se vuelve a la app más tarde que esto después del final, el cuenco ya no suena. */
const TOLERANCIA_CUENCO_MS = 60_000;

type Fin = { duracionSeg: number; guardada: boolean };

/** Temporizador de la sesión de Shiné: cuenco al comenzar y al terminar, y registro automático. */
export function SesionShine() {
  const enCurso = useLiveQuery(() => repositorio.shineEnCurso(), []);
  const [fin, setFin] = useState<Fin | null>(null);
  const pantallaEncendida = usePantallaEncendida();

  let contenido;
  if (fin) contenido = <Terminada fin={fin} />;
  else if (enCurso === undefined) contenido = null;
  else if (enCurso === null) contenido = <Preparar />;
  else contenido = <EnCurso enCurso={enCurso} alTerminar={setFin} />;

  return (
    <div className="tema-practica flex min-h-dvh flex-col bg-fondo pt-[env(safe-area-inset-top)] pb-[max(1rem,env(safe-area-inset-bottom))] text-tinta">
      <Lungta />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pt-4">
        {contenido}
        {!pantallaEncendida && !fin && (
          <p className="text-center text-tenue">
            Este navegador no puede mantener la pantalla encendida: si se apaga, el cuenco final puede no
            sonar.
          </p>
        )}
      </div>
    </div>
  );
}

function Preparar() {
  const hoy = useHoy();
  const prefs = usePreferencias();
  const [minutos, setMinutos] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!prefs) return null;
  const elegidos = minutos ?? prefs.minutosShine;
  const info = infoDelDia(hoy, prefs.fechaInicio, programa);
  const cambiar = (delta: number) =>
    setMinutos(Math.min(MINUTOS_MAXIMOS, Math.max(MINUTOS_MINIMOS, elegidos + delta)));

  async function comenzar() {
    // Primero el sonido, todavía dentro del toque: en iOS es lo que habilita el audio.
    sonarCuencoInicio();
    try {
      await repositorio.iniciarShine(elegidos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo comenzar.');
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[2rem] leading-tight font-semibold">Shiné</h1>
        <Link to="/" className={`${clasesBoton('secundario', 'w-auto')} shrink-0 whitespace-nowrap`}>
          Volver
        </Link>
      </header>

      {info && (
        <p className="text-tenue">
          Soporte de hoy: <span className="font-semibold text-tinta">{info.soporte.titulo}</span>
        </p>
      )}

      <section className="space-y-3">
        <label htmlFor="minutos-shine" className="block font-semibold">
          Duración, en minutos
        </label>
        <input
          id="minutos-shine"
          type="number"
          inputMode="numeric"
          min={MINUTOS_MINIMOS}
          max={MINUTOS_MAXIMOS}
          value={elegidos}
          onChange={(e) => setMinutos(Number(e.target.value))}
          className={`${claseCampo} min-h-[4.5rem] text-center font-serif text-[2.5rem] font-semibold tabular-nums`}
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={clasesBoton()}
            onClick={() => cambiar(-5)}
            aria-label="Restar 5 minutos"
          >
            −5
          </button>
          <button
            type="button"
            className={clasesBoton()}
            onClick={() => cambiar(5)}
            aria-label="Sumar 5 minutos"
          >
            +5
          </button>
        </div>
      </section>

      <div className="mt-auto space-y-3">
        {error && (
          <p role="alert" className="font-semibold">
            {error}
          </p>
        )}
        <button
          type="button"
          className={`${clasesBoton('principal')} min-h-[4.5rem] text-xl`}
          onClick={comenzar}
        >
          Comenzar
        </button>
        <p className="text-center text-tenue">
          Suena el cuenco al comenzar y al terminar. La pantalla queda encendida: no cierres la app ni
          bloquees el teléfono.
        </p>
      </div>
    </>
  );
}

function EnCurso({ enCurso, alTerminar }: { enCurso: ShineEnCurso; alTerminar: (fin: Fin) => void }) {
  const navigate = useNavigate();
  const [ahora, setAhora] = useState(() => Date.now());
  const [confirmando, setConfirmando] = useState(false);
  const [sonidoPendiente, setSonidoPendiente] = useState(() => !audioHabilitado());
  const agendado = useRef<CuencoAgendado | null>(null);
  const cerrando = useRef(false);
  const finMs = enCurso.inicioMs + enCurso.duracionSeg * 1000;
  const estado = estadoTemporizador(enCurso.inicioMs, enCurso.duracionSeg, ahora);

  // El reloj se redibuja con la hora real; nunca se cuentan ticks.
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 250);
    const alVolver = () => setAhora(Date.now());
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, []);

  // Agenda el cuenco final. Si la sesión se retomó tras cerrar la app, el navegador pide un toque antes.
  // Salir de la pantalla no cancela el cuenco: la sesión sigue y el final suena igual.
  useEffect(() => {
    if (agendado.current || Date.now() >= finMs || !audioHabilitado()) return;
    agendado.current = agendarCuencoFinal((finMs - Date.now()) / 1000);
  }, [finMs]);

  // Al cumplirse el tiempo: cuenco (si no se vuelve demasiado tarde) y registro automático.
  useEffect(() => {
    if (!estado.terminado || cerrando.current) return;
    cerrando.current = true;
    if (document.visibilityState === 'visible' && Date.now() - finMs < TOLERANCIA_CUENCO_MS) {
      asegurarCuencoFinal(agendado.current);
    }
    // Se avisa antes de cerrar en la base, para no mostrar un instante la pantalla de preparar.
    alTerminar({ duracionSeg: enCurso.duracionSeg, guardada: true });
    void repositorio.cerrarShine(true);
  }, [estado.terminado, finMs, enCurso.duracionSeg, alTerminar]);

  function activarSonido() {
    obtenerContexto();
    agendado.current = agendarCuencoFinal((finMs - Date.now()) / 1000);
    setSonidoPendiente(false);
  }

  async function terminarAntes(guardar: boolean) {
    cerrando.current = true;
    agendado.current?.cancelar();
    if (guardar) {
      alTerminar({ duracionSeg: estado.transcurridoSeg, guardada: true });
      await repositorio.cerrarShine(true);
    } else {
      await repositorio.cerrarShine(false);
      navigate('/');
    }
  }

  // El anillo avanza con fracciones de segundo, para que se mueva suave.
  const fraccionFina = Math.min(1, Math.max(0, (ahora - enCurso.inicioMs) / (enCurso.duracionSeg * 1000)));

  if (confirmando) {
    const puedeGuardar = estado.transcurridoSeg >= SEGUNDOS_MINIMOS_PARA_GUARDAR;
    const minutos = formatearMinutos(estado.transcurridoSeg);
    return (
      <div className="my-auto space-y-4">
        <h1 className="text-[1.75rem] leading-tight font-semibold">¿Terminar la sesión ahora?</h1>
        <p className="text-tenue">
          {puedeGuardar ? `Llevás ${minutos}.` : 'Pasó menos de un minuto: no hay nada para guardar.'}
        </p>
        {puedeGuardar && (
          <button type="button" className={clasesBoton('principal')} onClick={() => terminarAntes(true)}>
            Guardar {minutos}
          </button>
        )}
        <button type="button" className={clasesBoton()} onClick={() => terminarAntes(false)}>
          No guardar
        </button>
        <button type="button" className={clasesBoton()} onClick={() => setConfirmando(false)}>
          Seguir meditando
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="sr-only">Sesión de Shiné en curso</h1>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <AnilloReloj
          fraccion={fraccionFina}
          centro={formatearReloj(estado.restanteSeg)}
          pie={`de ${formatearMinutos(enCurso.duracionSeg)}`}
        />
        <p className="sr-only" aria-live="polite">
          {estado.restanteSeg % 300 === 0 ? `Quedan ${formatearMinutos(estado.restanteSeg)}` : ''}
        </p>
      </div>
      {sonidoPendiente && (
        <button type="button" className={clasesBoton('principal')} onClick={activarSonido}>
          Activar el cuenco final
        </button>
      )}
      <button type="button" className={clasesBoton()} onClick={() => setConfirmando(true)}>
        Terminar antes
      </button>
    </>
  );
}

function Terminada({ fin }: { fin: Fin }) {
  const dedicacion = guiaShine.pasos.at(-1);
  return (
    <div className="my-auto space-y-5 text-center">
      <p className="font-serif text-[2rem] leading-tight font-semibold">Sesión terminada</p>
      <p className="text-lg">
        {fin.guardada ? `Quedó registrada: ${formatearMinutos(fin.duracionSeg)}.` : 'No se registró.'}
      </p>
      {dedicacion && (
        <p className="text-tenue">
          Para cerrar: {dedicacion.titulo.toLowerCase()} ({textoPagina(dedicacion)}).
        </p>
      )}
      <Link to="/" className={clasesBoton('principal')}>
        Volver a Hoy
      </Link>
    </div>
  );
}
