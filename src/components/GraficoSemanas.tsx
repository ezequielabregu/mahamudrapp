import { useState } from 'react';
import { formatearDiaYMes, formatearNumero } from '../domain/formato';

interface Props {
  semanas: { inicio: string; minutos: number }[];
  /** Referencia: los minutos de una semana completa a media hora por día. */
  referencia: number;
}

const ALTO = 140;
const ANCHO_BARRA = 18;
const SEPARACION = 8;

/**
 * Minutos de Shiné por semana: una sola serie, barras finas en oro, una línea de referencia
 * y la semana actual rotulada. Tocar una barra muestra su valor; la tabla tiene todos.
 */
export function GraficoSemanas({ semanas, referencia }: Props) {
  const [elegida, setElegida] = useState<number>(semanas.length - 1);
  const [verTabla, setVerTabla] = useState(false);
  const maximo = Math.max(referencia, ...semanas.map((s) => s.minutos)) * 1.1;
  const ancho = semanas.length * (ANCHO_BARRA + SEPARACION);
  const y = (minutos: number) => ALTO - (minutos / maximo) * ALTO;
  const seleccion = semanas[elegida];

  return (
    <div className="space-y-3">
      <p aria-live="polite" className="text-tenue">
        {seleccion && (
          <>
            Semana del {formatearDiaYMes(seleccion.inicio)}:{' '}
            <span className="font-semibold text-tinta">{formatearNumero(seleccion.minutos)} minutos</span>
          </>
        )}
      </p>
      <svg
        viewBox={`0 0 ${ancho} ${ALTO + 2}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Minutos de Shiné en las últimas ${semanas.length} semanas`}
      >
        <line x1={0} x2={ancho} y1={ALTO} y2={ALTO} className="stroke-borde" strokeWidth={1} />
        <line
          x1={0}
          x2={ancho}
          y1={y(referencia)}
          y2={y(referencia)}
          className="stroke-tenue"
          strokeWidth={1}
        />
        {semanas.map((s, i) => {
          const x = i * (ANCHO_BARRA + SEPARACION) + SEPARACION / 2;
          const alto = Math.max(0, ALTO - y(s.minutos));
          const radio = Math.min(4, alto);
          return (
            <g key={s.inicio}>
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
                aria-label={`Semana del ${formatearDiaYMes(s.inicio)}: ${s.minutos} minutos`}
                onClick={() => setElegida(i)}
                onFocus={() => setElegida(i)}
                className="cursor-pointer outline-none"
              />
            </g>
          );
        })}
      </svg>
      <p className="flex items-center gap-2 text-tenue">
        <span aria-hidden="true" className="inline-block h-px w-6 bg-tenue" />
        {formatearNumero(referencia)} minutos: media hora todos los días
      </p>
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
              <th className="py-1 font-normal">Semana del</th>
              <th className="py-1 text-right font-normal">Minutos</th>
            </tr>
          </thead>
          <tbody>
            {[...semanas].reverse().map((s) => (
              <tr key={s.inicio} className="border-t border-borde">
                <td className="py-1">{formatearDiaYMes(s.inicio)}</td>
                <td className="py-1 text-right">{formatearNumero(s.minutos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
