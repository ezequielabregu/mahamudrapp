import type { NumeroTrimestre } from '../domain/programa';

interface Props {
  trimestre: NumeroTrimestre;
  diaDelTrimestre: number;
  diasDelTrimestre: number;
}

const CENTRO = 50;
const RADIO = 40;
const GROSOR = 9;
/** Separación entre trimestres, en grados (a cada lado de cada arco). */
const HUECO = 4;

function punto(angulo: number) {
  const rad = (angulo * Math.PI) / 180;
  return `${CENTRO + RADIO * Math.cos(rad)} ${CENTRO + RADIO * Math.sin(rad)}`;
}

/** Arco del círculo entre dos ángulos en grados (0 = derecha, sentido horario). */
function arco(desde: number, hasta: number): string {
  return `M ${punto(desde)} A ${RADIO} ${RADIO} 0 ${hasta - desde > 180 ? 1 : 0} 1 ${punto(hasta)}`;
}

/**
 * El año de práctica como un mandala de cuatro arcos, uno por trimestre, empezando arriba y en
 * sentido horario. Los trimestres cumplidos van en oro, el actual se llena según el día, y los
 * que faltan quedan apagados. En el centro, el número del trimestre, y debajo, el día.
 */
export function MandalaAnio({ trimestre, diaDelTrimestre, diasDelTrimestre }: Props) {
  const fraccion = Math.min(1, Math.max(0, diaDelTrimestre / diasDelTrimestre));
  return (
    <div
      role="img"
      aria-label={`Año de práctica: ${trimestre}º trimestre, día ${diaDelTrimestre} de ${diasDelTrimestre}`}
      className="flex flex-col items-center gap-0.5"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="h-[min(3.1rem,12vw)] w-[min(3.1rem,12vw)]">
        {[1, 2, 3, 4].map((n) => {
          const desde = -90 + (n - 1) * 90 + HUECO;
          const hasta = -90 + n * 90 - HUECO;
          const lleno = n < trimestre ? 1 : n === trimestre ? fraccion : 0;
          return (
            <g key={n}>
              <path
                d={arco(desde, hasta)}
                fill="none"
                stroke="rgb(255 255 255 / 0.16)"
                strokeWidth={GROSOR}
              />
              {lleno > 0 && (
                <path
                  d={arco(desde, desde + Math.max(lleno * (hasta - desde), 2))}
                  fill="none"
                  className="stroke-oro-claro"
                  strokeWidth={GROSOR}
                />
              )}
            </g>
          );
        })}
        <text
          x={CENTRO}
          y={CENTRO}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-sobre-banda font-serif font-semibold"
          fontSize={30}
        >
          {trimestre}º
        </text>
      </svg>
      <span
        aria-hidden="true"
        className="text-[min(0.8rem,3.6vw)] leading-none whitespace-nowrap text-sobre-banda/85"
      >
        día {diaDelTrimestre} de {diasDelTrimestre}
      </span>
    </div>
  );
}
