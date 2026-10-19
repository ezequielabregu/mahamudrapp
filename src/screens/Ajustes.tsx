import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { claseCampo, claseOpcion, clasesBoton } from '../components/estilos';
import { Seccion } from '../components/Seccion';
import { repositorio, type EscalaTexto, type Preferencias } from '../db/repositorio';
import { esFechaValida } from '../domain/fechas';
import { formatearFechaCorta } from '../domain/formato';
import { programa } from '../domain/programa';
import { useInstalacion } from '../hooks/useInstalacion';
import { usePreferencias } from '../hooks/usePreferencias';

const ESCALAS: { id: EscalaTexto; titulo: string }[] = [
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
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Ajustes</h1>

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

      <p className="text-center text-tenue">Versión {__VERSION_APP__}</p>
    </div>
  );
}

function useAlmacenamientoPersistente(): boolean | null {
  const [persistente, setPersistente] = useState<boolean | null>(null);
  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistente, () => setPersistente(null));
  }, []);
  return persistente;
}
