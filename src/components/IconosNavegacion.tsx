// Íconos de la barra de abajo: trazo fino, mismo grosor y tamaño, y siempre acompañados por su
// nombre (la regla de la app es no usar íconos sin texto).

import type { ReactNode } from 'react';

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[min(1.6rem,7vw)]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Persona meditando, sentada con las piernas cruzadas. */
export function IconoMeditacion() {
  return (
    <Icono>
      <circle cx={12} cy={4.4} r={2.2} />
      <path d="M12 8.6c-1.7 0-2.8 1-3.2 2.6l-.9 3.8M12 8.6c1.7 0 2.8 1 3.2 2.6l.9 3.8" />
      <path d="M7.9 15h-2.6M16.1 15h2.6" />
      <path d="M4 19.5c1.8-2 4.6-3 8-3s6.2 1 8 3H4Z" />
    </Icono>
  );
}

/** Gráfico de columnas. */
export function IconoAvance() {
  return (
    <Icono>
      <path d="M3.5 20.5h17" />
      <rect x={5} y={12} width={3} height={8.5} rx={0.8} />
      <rect x={10.5} y={7} width={3} height={13.5} rx={0.8} />
      <rect x={16} y={3.5} width={3} height={17} rx={0.8} />
    </Icono>
  );
}

/** Engranaje de ocho dientes, calculado para que quede parejo. */
const ENGRANAJE = (() => {
  const dientes = 8;
  const exterior = 9.6;
  const interior = 7.4;
  const puntos: string[] = [];
  for (let i = 0; i < dientes; i++) {
    const base = (i / dientes) * 2 * Math.PI;
    const paso = (2 * Math.PI) / dientes;
    for (const [fraccion, radio] of [
      [0.08, interior],
      [0.18, exterior],
      [0.42, exterior],
      [0.52, interior],
    ] as const) {
      const a = base + fraccion * paso;
      puntos.push(`${(12 + radio * Math.cos(a)).toFixed(2)} ${(12 + radio * Math.sin(a)).toFixed(2)}`);
    }
  }
  return `M${puntos.join(' L')} Z`;
})();

export function IconoAjustes() {
  return (
    <Icono>
      <path d={ENGRANAJE} />
      <circle cx={12} cy={12} r={3} />
    </Icono>
  );
}
