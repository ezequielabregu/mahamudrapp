// Maquetas simples de lo que se ve en Safari al instalar la app, para la guía de iPhone y iPad.
// Los íconos imitan los del sistema (en azul, como en iOS) y lo que hay que tocar va marcado con
// un borde dorado. Son ilustraciones: el texto de cada paso dice lo mismo en palabras.

import type { ReactNode } from 'react';

const AZUL_IOS = '#0a84ff';

function Icono({
  children,
  titulo,
  chico = false,
}: {
  children: ReactNode;
  titulo: string;
  chico?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={chico ? 'inline size-[1.2em] align-[-0.2em]' : 'size-7 shrink-0'}
      fill="none"
      stroke={AZUL_IOS}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={titulo}
    >
      {children}
    </svg>
  );
}

export function IconoCompartir() {
  return (
    <Icono titulo="Botón Compartir">
      <path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16" />
      <path d="M12 14V3M8.5 6.5 12 3l3.5 3.5" />
    </Icono>
  );
}

export function IconoTresPuntos({ chico = false }: { chico?: boolean }) {
  return (
    <Icono titulo="Botón de tres puntos" chico={chico}>
      <circle cx={12} cy={12} r={9.5} />
      <circle cx={7.5} cy={12} r={0.6} fill={AZUL_IOS} />
      <circle cx={12} cy={12} r={0.6} fill={AZUL_IOS} />
      <circle cx={16.5} cy={12} r={0.6} fill={AZUL_IOS} />
    </Icono>
  );
}

export function IconoAgregarInicio() {
  return (
    <Icono titulo="Ícono de Agregar a inicio">
      <rect x={3.5} y={3.5} width={17} height={17} rx={4} />
      <path d="M12 8v8M8 12h8" />
    </Icono>
  );
}

/** Lo que hay que tocar: un borde dorado alrededor. */
export function Tocar({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-xl p-1 ring-[3px] ring-oro">{children}</span>;
}

/** Recuadro que imita una pantalla o un menú del teléfono. */
export function Maqueta({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-3 rounded-2xl border border-borde bg-fondo px-4 py-4"
    >
      {children}
    </div>
  );
}

/** Una fila de un menú de iOS, con su ícono a la derecha. */
export function FilaMenu({ texto, icono }: { texto: string; icono: ReactNode }) {
  return (
    <span className="flex min-w-[13rem] items-center justify-between gap-4 rounded-xl bg-superficie px-4 py-2.5">
      <span className="font-semibold">{texto}</span>
      {icono}
    </span>
  );
}

/** Interruptor encendido, como los de iOS. */
export function Interruptor() {
  return (
    <span className="relative inline-block h-7 w-12 shrink-0 rounded-full bg-[#34c759]">
      <span className="absolute top-0.5 right-0.5 size-6 rounded-full bg-white shadow" />
    </span>
  );
}

/** El ícono de la app, como queda en la pantalla de inicio. */
export function IconoDeLaApp() {
  return (
    <span className="flex flex-col items-center gap-1">
      <img
        src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
        alt=""
        width={64}
        height={64}
        className="size-16 rounded-[1.1rem] shadow-md"
      />
      <span className="text-[0.8rem]">Mahamudra</span>
    </span>
  );
}

export const COLOR_ENLACE_IOS = AZUL_IOS;
