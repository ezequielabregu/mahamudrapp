interface Props {
  /** De 0 a 1. */
  fraccion: number;
  /** Texto grande del centro (tiempo que queda). */
  centro: string;
  /** Línea chica debajo del centro. */
  pie: string;
}

const RADIO = 45;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/**
 * Reloj sencillo: un anillo dorado que se completa a lo largo de la sesión, con un punto en
 * la punta. No usa animaciones CSS: solo se redibuja con el paso del tiempo.
 */
export function AnilloReloj({ fraccion, centro, pie }: Props) {
  const f = Math.min(1, Math.max(0, fraccion));
  const angulo = 2 * Math.PI * f - Math.PI / 2;
  const punta = { x: 50 + RADIO * Math.cos(angulo), y: 50 + RADIO * Math.sin(angulo) };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <circle cx={50} cy={50} r={RADIO} fill="none" className="stroke-pista" strokeWidth={3} />
        <circle
          cx={50}
          cy={50}
          r={RADIO}
          fill="none"
          className="stroke-oro"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - f)}
          transform="rotate(-90 50 50)"
        />
        <circle cx={punta.x} cy={punta.y} r={3.2} className="fill-oro stroke-fondo" strokeWidth={1.2} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-serif text-[clamp(3rem,16vw,4.75rem)] leading-none font-semibold tabular-nums">
          {centro}
        </p>
        <p className="mt-2 text-tenue">{pie}</p>
      </div>
    </div>
  );
}
