import { useState } from 'react';
import { formatearNumero } from '../domain/formato';

export interface Columna {
  clave: string;
  /** Rótulo corto para el eje (solo se muestran el primero y el último). */
  eje: string;
  /** Rótulo completo, para el detalle al tocar y la tabla. */
  nombre: string;
  valor: number;
}

interface Props {
  columnas: Columna[];
  unidad: string;
  /** Descripción del gráfico para lectores de pantalla. */
  descripcion: string;
  /** Línea horizontal de referencia (meta diaria, media hora por día...). */
  referencia?: { valor: number; texto: string };
  /** Encabezado de la primera columna de la tabla. */
  encabezado: string;
}

const ALTO = 140;
const ANCHO_BARRA = 18;
const SEPARACION = 6;

/**
 * Una sola serie en columnas finas de oro, con una línea de referencia opcional. Tocar una
 * columna muestra su valor; "Ver los números" abre la tabla con todos (nunca solo el color).
 */
export function GraficoColumnas({ columnas, unidad, descripcion, referencia, encabezado }: Props) {
  const [elegida, setElegida] = useState(columnas.length - 1);
  const [verTabla, setVerTabla] = useState(false);
  const maximo = Math.max(1, referencia?.valor ?? 0, ...columnas.map((c) => c.valor)) * 1.1;
  const ancho = columnas.length * (ANCHO_BARRA + SEPARACION);
  const y = (valor: number) => ALTO - (Math.max(0, valor) / maximo) * ALTO;
  const seleccion = columnas[elegida];

  return (
    <div className="space-y-3">
      <p aria-live="polite" className="text-tenue">
        {seleccion && (
          <>
            {seleccion.nombre}:{' '}
            <span className="font-semibold text-tinta">
              {formatearNumero(seleccion.valor)} {unidad}
            </span>
          </>
        )}
      </p>
      <div>
        <svg
          viewBox={`0 0 ${ancho} ${ALTO + 2}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={descripcion}
        >
          <line x1={0} x2={ancho} y1={ALTO} y2={ALTO} className="stroke-borde" strokeWidth={1} />
          {referencia && (
            <line
              x1={0}
              x2={ancho}
              y1={y(referencia.valor)}
              y2={y(referencia.valor)}
              className="stroke-tenue"
              strokeWidth={1}
            />
          )}
          {columnas.map((c, i) => {
            const x = i * (ANCHO_BARRA + SEPARACION) + SEPARACION / 2;
            const alto = ALTO - y(c.valor);
            const radio = Math.min(4, alto);
            return (
              <g key={c.clave}>
                {alto > 0 && (
                  <path
                    d={`M${x},${ALTO} V${ALTO - alto + radio} Q${x},${ALTO - alto} ${x + radio},${ALTO - alto} H${x + ANCHO_BARRA - radio} Q${x + ANCHO_BARRA},${ALTO - alto} ${x + ANCHO_BARRA},${ALTO - alto + radio} V${ALTO} Z`}
                    className={i === elegida ? 'fill-oro' : 'fill-calor-1'}
                  />
                )}
                <rect
                  x={x - SEPARACION / 2}
                  y={0}
                  width={ANCHO_BARRA + SEPARACION}
                  height={ALTO}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.nombre}: ${formatearNumero(c.valor)} ${unidad}`}
                  onClick={() => setElegida(i)}
                  onFocus={() => setElegida(i)}
                  className="cursor-pointer outline-none"
                />
              </g>
            );
          })}
        </svg>
        <div aria-hidden="true" className="mt-1 flex justify-between text-tenue">
          <span>{columnas[0]?.eje}</span>
          <span>{columnas.at(-1)?.eje}</span>
        </div>
      </div>
      {referencia && (
        <p className="flex items-center gap-2 text-tenue">
          <span aria-hidden="true" className="inline-block h-px w-6 shrink-0 bg-tenue" />
          {referencia.texto}
        </p>
      )}
      <button
        type="button"
        aria-expanded={verTabla}
        onClick={() => setVerTabla((v) => !v)}
        className="min-h-[3rem] font-semibold text-acento underline underline-offset-4"
      >
        {verTabla ? 'Ocultar los números' : 'Ver los números'}
      </button>
      {verTabla && (
        <table className="w-full tabular-nums">
          <thead>
            <tr className="text-left text-tenue">
              <th className="py-1 font-normal">{encabezado}</th>
              <th className="py-1 text-right font-normal">
                {unidad.charAt(0).toUpperCase() + unidad.slice(1)}
              </th>
            </tr>
          </thead>
          <tbody>
            {[...columnas].reverse().map((c) => (
              <tr key={c.clave} className="border-t border-borde">
                <td className="py-1">{c.nombre}</td>
                <td className="py-1 text-right">{formatearNumero(c.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
