import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { claseCampo, claseOpcion, clasesBoton } from '../components/estilos';
import { Seccion } from '../components/Seccion';
import { repositorio } from '../db/repositorio';
import type { TipoSesion } from '../db/schema';
import { formatearFechaLarga, formatearNumero } from '../domain/formato';
import { PRACTICAS, programa, type Practica } from '../domain/programa';
import { useHoy } from '../hooks/useHoy';

export function Registrar() {
  const [params, setParams] = useSearchParams();
  const [hecho, setHecho] = useState<string | null>(null);
  const que = params.get('que');

  if (hecho) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Listo</h1>
        <p role="status">{hecho}</p>
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
      </div>
    );
  }

  if (que === 'sesion') return <FormularioSesion alGuardar={setHecho} />;
  if (que === 'conteo') return <FormularioConteo alGuardar={setHecho} />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Registrar</h1>
      <p>Para anotar práctica que hiciste sin la app, o corregir un número.</p>
      <Link to="?que=sesion" className={clasesBoton('principal')}>
        Una sesión de meditación
      </Link>
      <Link to="?que=conteo" className={clasesBoton('principal')}>
        Postraciones o mantras
      </Link>
    </div>
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
    <form onSubmit={guardar} className="space-y-5">
      <h1 className="text-2xl font-bold">Sesión de meditación</h1>

      <CampoFecha valor={fecha} maximo={hoy} alCambiar={setFecha} />

      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">¿Qué sesión?</legend>
        <Opcion nombre="tipo" marcada={tipo === 'shine'} alElegir={() => setTipo('shine')}>
          Shiné (meditación)
        </Opcion>
        <Opcion nombre="tipo" marcada={tipo === 'preliminar'} alElegir={() => setTipo('preliminar')}>
          Preliminares
        </Opcion>
      </fieldset>

      <div>
        <label htmlFor="minutos" className="mb-2 block font-semibold">
          Minutos
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${clasesBoton('secundario', 'w-20')} shrink-0`}
            aria-label="Restar 5 minutos"
            onClick={() => setMinutos((m) => Math.max(1, m - 5))}
          >
            −5
          </button>
          <input
            id="minutos"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            required
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
            className={`${claseCampo} text-center tabular-nums`}
          />
          <button
            type="button"
            className={`${clasesBoton('secundario', 'w-20')} shrink-0`}
            aria-label="Sumar 5 minutos"
            onClick={() => setMinutos((m) => Math.min(600, m + 5))}
          >
            +5
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="font-semibold">
          {error}
        </p>
      )}
      <button type="submit" className={clasesBoton('principal')}>
        Guardar
      </button>
      <Link to="/registrar" className={clasesBoton()}>
        Cancelar
      </Link>
    </form>
  );
}

function FormularioConteo({ alGuardar }: PropsFormulario) {
  const hoy = useHoy();
  const [fecha, setFecha] = useState(hoy);
  const [practica, setPractica] = useState<Practica>('postraciones');
  const [cantidad, setCantidad] = useState('');
  const [restar, setRestar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unidad = programa.practicas[practica].unidad;

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
    <form onSubmit={guardar} className="space-y-5">
      <h1 className="text-2xl font-bold">Postraciones o mantras</h1>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">¿Qué práctica?</legend>
        {PRACTICAS.map((p) => (
          <Opcion key={p} nombre="practica" marcada={practica === p} alElegir={() => setPractica(p)}>
            {programa.practicas[p].titulo}
          </Opcion>
        ))}
      </fieldset>

      <CampoFecha valor={fecha} maximo={hoy} alCambiar={setFecha} />

      <div>
        <label htmlFor="cantidad" className="mb-2 block font-semibold">
          Cantidad
        </label>
        <input
          id="cantidad"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          required
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className={`${claseCampo} tabular-nums`}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">¿Sumar o restar?</legend>
        <Opcion nombre="operacion" marcada={!restar} alElegir={() => setRestar(false)}>
          Sumar
        </Opcion>
        <Opcion nombre="operacion" marcada={restar} alElegir={() => setRestar(true)}>
          Restar, para corregir un error
        </Opcion>
      </fieldset>

      {error && (
        <p role="alert" className="font-semibold">
          {error}
        </p>
      )}
      <button type="submit" className={clasesBoton('principal')}>
        {restar ? 'Guardar la corrección' : 'Guardar'}
      </button>
      <Link to="/registrar" className={clasesBoton()}>
        Cancelar
      </Link>
    </form>
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
