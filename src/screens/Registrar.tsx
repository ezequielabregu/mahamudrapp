import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { claseCampo, claseCampoNumero, claseOpcion, clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { repositorio } from '../db/repositorio';
import type { TipoSesion } from '../db/schema';
import { formatearFechaLarga, formatearNumero } from '../domain/formato';
import { practicasDelNivel } from '../domain/niveles';
import { esPractica, programa, type Practica } from '../domain/programa';
import { useHoy } from '../hooks/useHoy';
import { usePreferencias } from '../hooks/usePreferencias';

export function Registrar() {
  const [params, setParams] = useSearchParams();
  const [hecho, setHecho] = useState<string | null>(null);
  const que = params.get('que');

  if (hecho) {
    return (
      <Pantalla titulo="Listo">
        <p role="status" className="text-lg">
          {hecho}
        </p>
        <Link to="/" className={clasesBoton('principal')}>
          Volver a Hoy
        </Link>
        <button
          type="button"
          className={clasesBoton()}
          onClick={() => {
            setHecho(null);
            setParams({});
          }}
        >
          Registrar otra cosa
        </button>
      </Pantalla>
    );
  }

  if (que === 'sesion') return <FormularioSesion alGuardar={setHecho} />;
  if (que === 'conteo') return <FormularioConteo alGuardar={setHecho} inicial={params.get('practica')} />;

  return (
    <Pantalla titulo="Registrar" volver={{ a: '/ajustes', texto: 'Ajustes' }}>
      <p>Para anotar práctica que hiciste sin la app, o corregir un número.</p>
      <Link to="?que=sesion" className={clasesBoton('principal')}>
        Una sesión de meditación
      </Link>
      <Link to="?que=conteo" className={clasesBoton('principal')}>
        Postraciones o mantras
      </Link>
    </Pantalla>
  );
}

interface PropsFormulario {
  alGuardar: (resumen: string) => void;
}

function FormularioSesion({ alGuardar }: PropsFormulario) {
  const hoy = useHoy();
  const [fecha, setFecha] = useState(hoy);
  const [tipo, setTipo] = useState<TipoSesion>('shine');
  const [minutos, setMinutos] = useState(programa.minutosMeditacionDiaria);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    try {
      await repositorio.registrarSesion({
        tipo,
        origen: 'manual',
        fechaLocal: fecha,
        duracionSeg: Math.round(minutos) * 60,
      });
      const nombre = tipo === 'shine' ? 'Sesión de Shiné' : 'Sesión de preliminares';
      alGuardar(`${nombre} del ${formatearFechaLarga(fecha).toLowerCase()}: ${minutos} minutos.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <Pantalla titulo="Sesión" volver={{ a: '/registrar', texto: 'Registrar' }}>
      <form onSubmit={guardar} className="space-y-5">
        <Seccion titulo="¿Qué sesión?">
          <fieldset className="space-y-2">
            <legend className="sr-only">¿Qué sesión?</legend>
            <Opcion nombre="tipo" marcada={tipo === 'shine'} alElegir={() => setTipo('shine')}>
              Shiné (meditación)
            </Opcion>
            <Opcion nombre="tipo" marcada={tipo === 'preliminar'} alElegir={() => setTipo('preliminar')}>
              Preliminares
            </Opcion>
          </fieldset>
        </Seccion>

        <CampoFecha valor={fecha} maximo={hoy} alCambiar={setFecha} />

        <Seccion titulo="Minutos">
          <label htmlFor="minutos" className="sr-only">
            Minutos
          </label>
          {/* El número va solo en su fila: entre los botones se cortaba en teléfonos angostos. */}
          <input
            id="minutos"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            required
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
            className={claseCampoNumero}
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={clasesBoton()}
              aria-label="Restar 5 minutos"
              onClick={() => setMinutos((m) => Math.max(1, m - 5))}
            >
              −5
            </button>
            <button
              type="button"
              className={clasesBoton()}
              aria-label="Sumar 5 minutos"
              onClick={() => setMinutos((m) => Math.min(600, m + 5))}
            >
              +5
            </button>
          </div>
        </Seccion>

        <MensajeError mensaje={error} />
        <button type="submit" className={clasesBoton('principal')}>
          Guardar
        </button>
        <BotonCancelar />
      </form>
    </Pantalla>
  );
}

function FormularioConteo({ alGuardar, inicial }: PropsFormulario & { inicial: string | null }) {
  const hoy = useHoy();
  const practicas = practicasDelNivel(usePreferencias()?.nivel ?? 1, programa);
  const [fecha, setFecha] = useState(hoy);
  // Desde Hoy, la práctica llega ya elegida (?practica=chenresi).
  const [practica, setPractica] = useState<Practica>(
    esPractica(inicial ?? undefined) ? (inicial as Practica) : 'postraciones',
  );
  const [cantidad, setCantidad] = useState('');
  const [restar, setRestar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { unidad, nota } = programa.practicas[practica];

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const n = Number(cantidad);
    try {
      await repositorio.registrarConteo({
        practica,
        cantidad: restar ? -n : n,
        fechaLocal: fecha,
        origen: restar ? 'correccion' : 'manual',
      });
      const accion = restar ? 'Se restaron' : 'Se sumaron';
      alGuardar(`${accion} ${formatearNumero(n)} ${unidad} el ${formatearFechaLarga(fecha).toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <Pantalla titulo="Conteo" volver={{ a: '/registrar', texto: 'Registrar' }}>
      <form onSubmit={guardar} className="space-y-5">
        <Seccion titulo="¿Qué práctica?">
          <fieldset className="space-y-2">
            <legend className="sr-only">¿Qué práctica?</legend>
            {practicas.map((p) => (
              <Opcion key={p} nombre="practica" marcada={practica === p} alElegir={() => setPractica(p)}>
                {programa.practicas[p].titulo}
              </Opcion>
            ))}
          </fieldset>
        </Seccion>

        <CampoFecha valor={fecha} maximo={hoy} alCambiar={setFecha} />

        <Seccion titulo={`Cantidad de ${unidad}`}>
          {/* La indicación va afuera y no como placeholder: adentro se cortaba en teléfonos angostos. */}
          <label htmlFor="cantidad" className="block text-tenue">
            Tocá el recuadro y escribí el número.
            <span className="sr-only"> Cantidad de {unidad}</span>
          </label>
          <input
            id="cantidad"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            aria-describedby={nota ? 'nota-cantidad' : undefined}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className={claseCampoNumero}
          />
          {nota && (
            <p id="nota-cantidad" className="text-tenue">
              {nota}
            </p>
          )}
        </Seccion>

        <Seccion titulo="¿Sumar o restar?">
          <fieldset className="space-y-2">
            <legend className="sr-only">¿Sumar o restar?</legend>
            <Opcion nombre="operacion" marcada={!restar} alElegir={() => setRestar(false)}>
              Sumar
            </Opcion>
            <Opcion nombre="operacion" marcada={restar} alElegir={() => setRestar(true)}>
              Restar, para corregir un error
            </Opcion>
          </fieldset>
        </Seccion>

        <MensajeError mensaje={error} />
        <button type="submit" className={clasesBoton('principal')}>
          {restar ? 'Guardar la corrección' : 'Guardar'}
        </button>
        <BotonCancelar />
      </form>
    </Pantalla>
  );
}

function CampoFecha(props: { valor: string; maximo: string; alCambiar: (v: string) => void }) {
  return (
    <Seccion titulo="Fecha">
      <label htmlFor="fecha" className="sr-only">
        Fecha
      </label>
      <input
        id="fecha"
        type="date"
        required
        max={props.maximo}
        value={props.valor}
        onChange={(e) => props.alCambiar(e.target.value)}
        className={claseCampo}
      />
      <p className="text-tenue">{props.valor && formatearFechaLarga(props.valor)}</p>
    </Seccion>
  );
}

function Opcion(props: { nombre: string; marcada: boolean; alElegir: () => void; children: string }) {
  return (
    <label className={claseOpcion}>
      <input
        type="radio"
        name={props.nombre}
        checked={props.marcada}
        onChange={props.alElegir}
        className="size-6 accent-acento"
      />
      {props.children}
    </label>
  );
}

function MensajeError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="font-semibold text-acento">
      {mensaje}
    </p>
  );
}

/** Vuelve a la pantalla anterior (Hoy o Registrar); si se abrió directo, a Registrar. */
function BotonCancelar() {
  const navigate = useNavigate();
  const hayAnterior = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0;
  return (
    <button
      type="button"
      className={clasesBoton()}
      onClick={() => (hayAnterior ? navigate(-1) : navigate('/registrar'))}
    >
      Cancelar
    </button>
  );
}
