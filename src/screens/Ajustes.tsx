import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { claseCampo, claseOpcion, clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { repositorio, type Apariencia, type EscalaTexto, type Preferencias } from '../db/repositorio';
import { esFechaValida } from '../domain/fechas';
import { contar, formatearFechaCorta, haceCuanto } from '../domain/formato';
import { programa } from '../domain/programa';
import { useHoy } from '../hooks/useHoy';
import { useInstalacion } from '../hooks/useInstalacion';
import { usePreferencias } from '../hooks/usePreferencias';

const APARIENCIAS: { id: Apariencia; titulo: string; descripcion: string }[] = [
  { id: 'automatica', titulo: 'Automática', descripcion: 'Sigue el modo claro u oscuro del teléfono.' },
  { id: 'clara', titulo: 'Clara', descripcion: 'Fondo claro, como papel.' },
  { id: 'oscura', titulo: 'Oscura', descripcion: 'Poca luz en la pantalla, para meditar.' },
];

const ESCALAS: { id: EscalaTexto; titulo: string }[] = [
  { id: 'pequeno', titulo: 'Pequeño' },
  { id: 'normal', titulo: 'Normal' },
  { id: 'grande', titulo: 'Grande' },
  { id: 'muy-grande', titulo: 'Muy grande' },
];

export function Ajustes() {
  const prefs = usePreferencias();
  if (!prefs) return null;
  return <FormularioAjustes prefs={prefs} />;
}

function FormularioAjustes({ prefs }: { prefs: Preferencias }) {
  const instalacion = useInstalacion();
  const [fecha, setFecha] = useState(prefs.fechaInicio);
  const [fechaGuardada, setFechaGuardada] = useState(false);
  const almacenamiento = useAlmacenamientoPersistente();

  async function guardarFecha() {
    if (!esFechaValida(fecha)) return;
    await repositorio.guardarPreferencia('fechaInicio', fecha);
    setFechaGuardada(true);
  }

  return (
    <Pantalla titulo="Ajustes">
      <Registros />

      <Seccion titulo="Nivel">
        <fieldset className="space-y-2">
          <legend className="sr-only">Nivel del programa</legend>
          {programa.niveles.map((n) => (
            <label key={n.numero} className={claseOpcion}>
              <input
                type="radio"
                name="nivel"
                checked={prefs.nivel === n.numero}
                onChange={() => repositorio.guardarPreferencia('nivel', n.numero)}
                className="size-6 shrink-0 accent-acento"
              />
              <span>
                <span className="block">
                  Nivel {n.numero} · {n.nombre}
                </span>
                {prefs.nivel === n.numero && (
                  <span className="block font-normal text-tenue">{n.compromiso}</span>
                )}
              </span>
            </label>
          ))}
        </fieldset>
      </Seccion>

      {prefs.nivel === 1 && (
        <Seccion titulo="Compromiso de práctica">
          <fieldset className="space-y-2">
            <legend className="sr-only">Compromiso de práctica</legend>
            {programa.compromisos.map((c) => (
              <label key={c.id} className={claseOpcion}>
                <input
                  type="radio"
                  name="compromiso"
                  checked={prefs.compromiso === c.id}
                  onChange={() => repositorio.guardarPreferencia('compromiso', c.id)}
                  className="size-6 shrink-0 accent-acento"
                />
                <span>
                  <span className="block">{c.titulo}</span>
                  <span className="block font-normal text-tenue">{c.descripcion}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </Seccion>
      )}

      <Seccion titulo="Apariencia">
        <fieldset className="space-y-2">
          <legend className="sr-only">Apariencia</legend>
          {APARIENCIAS.map((a) => (
            <label key={a.id} className={claseOpcion}>
              <input
                type="radio"
                name="apariencia"
                checked={prefs.apariencia === a.id}
                onChange={() => repositorio.guardarPreferencia('apariencia', a.id)}
                className="size-6 shrink-0 accent-acento"
              />
              <span>
                <span className="block">{a.titulo}</span>
                <span className="block font-normal text-tenue">{a.descripcion}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Seccion>

      <Seccion titulo="Tamaño del texto">
        <fieldset className="space-y-2">
          <legend className="sr-only">Tamaño del texto</legend>
          {ESCALAS.map((e) => (
            <label key={e.id} className={claseOpcion}>
              <input
                type="radio"
                name="escala"
                checked={prefs.escalaTexto === e.id}
                onChange={() => repositorio.guardarPreferencia('escalaTexto', e.id)}
                className="size-6 accent-acento"
              />
              {e.titulo}
            </label>
          ))}
        </fieldset>
      </Seccion>

      <Seccion titulo="Sonido al contar">
        <fieldset className="space-y-2">
          <legend className="sr-only">Sonido al contar</legend>
          {[true, false].map((valor) => (
            <label key={String(valor)} className={claseOpcion}>
              <input
                type="radio"
                name="sonido"
                checked={prefs.sonidoContador === valor}
                onChange={() => repositorio.guardarPreferencia('sonidoContador', valor)}
                className="size-6 accent-acento"
              />
              {valor ? 'Sí, un sonido suave en cada toque' : 'No, en silencio'}
            </label>
          ))}
        </fieldset>
      </Seccion>

      <Seccion titulo="Inicio del año de práctica">
        <p className="text-tenue">Ahora: {formatearFechaCorta(prefs.fechaInicio)}.</p>
        <label htmlFor="fecha-inicio" className="sr-only">
          Fecha de inicio
        </label>
        <input
          id="fecha-inicio"
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            setFechaGuardada(false);
          }}
          className={claseCampo}
        />
        <button
          type="button"
          className={clasesBoton()}
          disabled={fecha === prefs.fechaInicio || !esFechaValida(fecha)}
          onClick={guardarFecha}
        >
          Guardar la fecha
        </button>
        {fechaGuardada && <p role="status">Fecha guardada.</p>}
      </Seccion>

      <Seccion titulo="Este teléfono">
        <p>{instalacion.instalada ? 'La app está instalada.' : 'La app todavía no está instalada.'}</p>
        {!instalacion.instalada && (
          <Link to="/instalar" className={clasesBoton()}>
            Cómo instalarla
          </Link>
        )}
        {almacenamiento !== null && (
          <p className="text-tenue">
            {almacenamiento
              ? 'El navegador se comprometió a no borrar tus registros.'
              : 'El navegador no garantiza conservar tus registros: hacé copias seguido.'}
          </p>
        )}
      </Seccion>

      <BorrarRegistros />

      <p className="text-center text-tenue">Versión {__VERSION_APP__}</p>
    </Pantalla>
  );
}

function Registros() {
  const hoy = useHoy();
  const ultima = useLiveQuery(() => repositorio.ultimoRespaldo(), []);
  return (
    <Seccion titulo="Registros">
      <Link to="/registrar" className={clasesBoton()}>
        Registrar o corregir
      </Link>
      <Link to="/respaldo" className={clasesBoton()}>
        Copia de seguridad
      </Link>
      <p className="text-tenue">
        {ultima
          ? `Última copia: ${haceCuanto(ultima.fechaLocal, hoy)}.`
          : 'Todavía no hiciste ninguna copia de seguridad.'}
      </p>
    </Seccion>
  );
}

const claseBotonPeligro =
  'inline-flex w-full min-h-[3rem] items-center justify-center rounded-full border-2 border-peligro px-6 ' +
  'font-semibold text-peligro';

/**
 * Borrado de todos los registros, con resguardos: exige una copia hecha hoy y una
 * confirmación que dice cuánto se va a borrar. Los ajustes se conservan.
 */
function BorrarRegistros() {
  const hoy = useHoy();
  const ultima = useLiveQuery(() => repositorio.ultimoRespaldo(), []);
  const registros = useLiveQuery(() => repositorio.cantidadDeRegistros(), []);
  const [confirmando, setConfirmando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);
  if (!registros) return null;

  const total = registros.sesiones + registros.conteos;
  const copiaDeHoy = ultima?.fechaLocal === hoy;

  async function borrar() {
    try {
      await repositorio.borrarRegistros();
      setEstado('Se borraron todos los registros.');
    } catch (err) {
      setEstado(err instanceof Error ? err.message : 'No se pudo borrar.');
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <Seccion titulo="Borrar todos los registros">
      {estado && <p role="status">{estado}</p>}
      {total === 0 ? (
        !estado && <p className="text-tenue">No hay registros guardados.</p>
      ) : (
        <>
          <p className="text-tenue">
            Borra todas las sesiones y conteos de este teléfono; tus ajustes se conservan. Lo borrado solo se
            puede recuperar restaurando la copia de hoy.
          </p>
          {!copiaDeHoy ? (
            <>
              <p>Para poder borrar, primero hacé una copia de seguridad hoy.</p>
              <Link to="/respaldo" className={clasesBoton()}>
                Hacer una copia
              </Link>
            </>
          ) : !confirmando ? (
            <button type="button" className={claseBotonPeligro} onClick={() => setConfirmando(true)}>
              Borrar todos los registros
            </button>
          ) : (
            <div className="space-y-3 rounded-2xl border-2 border-peligro p-4">
              <p role="alert" className="font-semibold">
                ¿Seguro? Se van a borrar {contar(registros.sesiones, 'sesión', 'sesiones')} y{' '}
                {contar(registros.conteos, 'conteo', 'conteos')}. No se puede deshacer.
              </p>
              <button
                type="button"
                className={`${claseBotonPeligro} bg-peligro text-superficie`}
                onClick={borrar}
              >
                Sí, borrar todo
              </button>
              <button type="button" className={clasesBoton()} onClick={() => setConfirmando(false)}>
                No, cancelar
              </button>
            </div>
          )}
        </>
      )}
    </Seccion>
  );
}

function useAlmacenamientoPersistente(): boolean | null {
  const [persistente, setPersistente] = useState<boolean | null>(null);
  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistente, () => setPersistente(null));
  }, []);
  return persistente;
}
