import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { clasePildora, claseTarjeta, clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { repositorio } from '../db/repositorio';
import { sumarDias } from '../domain/fechas';
import { formatearFechaLarga, formatearNumero } from '../domain/formato';
import {
  historialPorDia,
  practicasConRegistros,
  type FiltroHistorial,
  type LineaHistorial,
} from '../domain/historial';
import { programa } from '../domain/programa';
import { useHoy } from '../hooks/useHoy';

/** Cuántos días con registros se muestran por vez. */
const DIAS_POR_VEZ = 20;

const ORIGEN_CONTEO: Record<string, string> = {
  contador: 'con el contador',
  manual: 'cargado a mano',
  correccion: 'corrección',
  sesion: 'en la sesión',
  importacion: 'de una copia restaurada',
};

/** Todo lo registrado, día por día. Solo para mirar: las correcciones se hacen en Registrar. */
export function Historial() {
  const hoy = useHoy();
  // Se entra desde Ajustes o desde Avance: el botón de volver lleva a la pantalla de origen.
  const desdeAvance = (useLocation().state as { desde?: string } | null)?.desde === '/avance';
  const [filtro, setFiltro] = useState<FiltroHistorial>('todo');
  const [cuantos, setCuantos] = useState(DIAS_POR_VEZ);
  const datos = useLiveQuery(async () => {
    const [sesiones, conteos] = await Promise.all([
      repositorio.todasLasSesiones(),
      repositorio.todosLosConteos(),
    ]);
    return { sesiones, conteos };
  }, []);
  if (!datos) return null;

  const hayShine = datos.sesiones.some((s) => s.tipo === 'shine');
  const opciones: { valor: FiltroHistorial; texto: string }[] = [
    { valor: 'todo', texto: 'Todo' },
    ...(hayShine ? [{ valor: 'shine' as const, texto: 'Shiné' }] : []),
    ...practicasConRegistros(datos.conteos).map((p) => ({ valor: p, texto: programa.practicas[p].corto })),
  ];
  const dias = historialPorDia(datos.sesiones, datos.conteos, filtro);
  const ayer = sumarDias(hoy, -1);

  return (
    <Pantalla
      titulo="Historial"
      volver={desdeAvance ? { a: '/avance', texto: 'Avance' } : { a: '/ajustes', texto: 'Ajustes' }}
    >
      <p className="text-tenue">
        Todo lo que registraste, día por día. Para corregir algo, usá{' '}
        <Link to="/registrar" className="font-semibold text-oro underline underline-offset-4">
          Registrar
        </Link>
        .
      </p>

      {opciones.length > 2 && (
        <div role="group" aria-label="Qué mostrar" className="flex flex-wrap gap-2">
          {opciones.map((o) => (
            <button
              key={o.valor}
              type="button"
              aria-pressed={filtro === o.valor}
              onClick={() => {
                setFiltro(o.valor);
                setCuantos(DIAS_POR_VEZ);
              }}
              className={clasePildora(filtro === o.valor)}
            >
              {o.texto}
            </button>
          ))}
        </div>
      )}

      {dias.length === 0 && <p className="text-tenue">Todavía no hay nada registrado.</p>}

      {dias.slice(0, cuantos).map((dia) => (
        <section
          key={dia.fecha}
          aria-label={formatearFechaLarga(dia.fecha)}
          className={`${claseTarjeta} p-5`}
        >
          <h2 className="font-sans text-lg font-semibold">
            {dia.fecha === hoy ? 'Hoy · ' : dia.fecha === ayer ? 'Ayer · ' : ''}
            {formatearFechaLarga(dia.fecha)}
          </h2>
          <ul className="mt-2 divide-y divide-borde">
            {dia.lineas.map((l) => (
              <Linea key={l.id} linea={l} />
            ))}
          </ul>
        </section>
      ))}

      {dias.length > cuantos && (
        <button type="button" className={clasesBoton()} onClick={() => setCuantos((n) => n + DIAS_POR_VEZ)}>
          Ver días anteriores
        </button>
      )}
    </Pantalla>
  );
}

function Linea({ linea }: { linea: LineaHistorial }) {
  const [titulo, detalle, valor] =
    linea.clase === 'sesion'
      ? [
          linea.tipo === 'shine' ? 'Shiné' : 'Sesión de preliminares',
          linea.origen === 'app' ? 'con el temporizador' : 'cargada a mano',
          `${linea.minutos} min`,
        ]
      : [
          programa.practicas[linea.practica].titulo,
          ORIGEN_CONTEO[linea.origen] ?? '',
          `${linea.cantidad < 0 ? '−' : ''}${formatearNumero(Math.abs(linea.cantidad))}`,
        ];
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="min-w-0">
        <span className="block font-semibold">{titulo}</span>
        <span className="block text-tenue">{detalle}</span>
      </span>
      <span className="shrink-0 font-serif text-xl font-semibold tabular-nums">{valor}</span>
    </li>
  );
}
