import { useState } from 'react';
import { inicioDeSemana } from '../domain/estadisticas';
import { sumarDias } from '../domain/fechas';
import { formatearFechaLarga } from '../domain/formato';

interface Props {
  /** Primer día del período. */
  desde: string;
  /** Primer día después del período. */
  hasta: string;
  hoy: string;
  minutos: Map<string, number>;
}

const FILAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const NIVELES = [
  { clase: 'bg-pista', texto: 'Sin sesión' },
  { clase: 'bg-calor-1', texto: 'Menos de 30 min' },
  { clase: 'bg-calor-2', texto: '30 a 44 min' },
  { clase: 'bg-calor-3', texto: '45 min o más' },
];

function nivel(minutos: number): number {
  if (minutos <= 0) return 0;
  if (minutos < 30) return 1;
  if (minutos < 45) return 2;
  return 3;
}

/**
 * Calendario del trimestre: una columna por semana (de lunes a domingo) y cada día
 * con un tono de oro según los minutos de Shiné. Tocar un día muestra su detalle.
 */
export function MapaDeCalor({ desde, hasta, hoy, minutos }: Props) {
  const [elegido, setElegido] = useState<string | null>(null);
  const semanas: string[][] = [];
  for (let inicio = inicioDeSemana(desde); inicio < hasta; inicio = sumarDias(inicio, 7)) {
    semanas.push(Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i)));
  }
  const minutosElegido = elegido ? Math.round(minutos.get(elegido) ?? 0) : 0;

  return (
    <div className="space-y-3">
      <p aria-live="polite" className="min-h-[1.5em] text-tenue">
        {elegido ? (
          <>
            {formatearFechaLarga(elegido)}:{' '}
            <span className="font-semibold text-tinta">
              {minutosElegido > 0 ? `${minutosElegido} minutos de Shiné` : 'sin sesión de Shiné'}
            </span>
          </>
        ) : (
          'Tocá un día para ver el detalle.'
        )}
      </p>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `1.2rem repeat(${semanas.length}, minmax(0, 1fr))` }}
      >
        {FILAS.map((letra, fila) => (
          <div key={fila} className="contents">
            <span
              aria-hidden="true"
              className="self-center text-center leading-none text-tenue"
              style={{ gridColumn: 1, gridRow: fila + 1 }}
            >
              {letra}
            </span>
            {semanas.map((dias, columna) => {
              const fecha = dias[fila]!;
              const posicion = { gridColumn: columna + 2, gridRow: fila + 1 };
              if (fecha < desde || fecha >= hasta) return <span key={fecha} style={posicion} />;
              if (fecha > hoy) {
                return (
                  <span
                    key={fecha}
                    style={posicion}
                    className="aspect-square rounded-[3px] border border-borde"
                    aria-hidden="true"
                  />
                );
              }
              const m = minutos.get(fecha) ?? 0;
              return (
                <button
                  key={fecha}
                  type="button"
                  style={posicion}
                  onClick={() => setElegido(fecha)}
                  aria-label={`${formatearFechaLarga(fecha)}: ${m > 0 ? `${Math.round(m)} minutos` : 'sin sesión'}`}
                  className={
                    `aspect-square rounded-[3px] ${NIVELES[nivel(m)]!.clase} ` +
                    (fecha === elegido ? 'outline-2 outline-offset-1 outline-tinta' : '') +
                    (fecha === hoy ? ' ring-2 ring-acento ring-offset-1 ring-offset-superficie' : '')
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-tenue">
        {NIVELES.map((n) => (
          <li key={n.texto} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block size-3.5 rounded-[3px] ${n.clase}`} />
            {n.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
