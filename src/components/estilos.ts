export type VarianteBoton = 'principal' | 'secundario';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 text-center font-semibold ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-40 select-none';

const variantes: Record<VarianteBoton, string> = {
  principal: 'min-h-[3.75rem] bg-acento text-sobre-acento text-lg shadow-sm active:brightness-110',
  secundario: 'min-h-[3rem] border-2 border-acento text-acento bg-transparent active:bg-resalte',
};

/** Áreas táctiles: 3rem = 60 px y 3.75rem = 75 px con el tamaño base de 20 px. */
export function clasesBoton(variante: VarianteBoton = 'secundario', ancho = 'w-full'): string {
  return `${base} ${ancho} ${variantes[variante]}`;
}

export const claseTarjeta =
  'rounded-3xl border border-borde bg-superficie ' +
  'shadow-[0_1px_2px_rgb(42_26_20/0.05),0_12px_28px_-16px_rgb(42_26_20/0.25)]';

export const claseCampo =
  'block w-full min-w-0 min-h-[3rem] rounded-2xl border-2 border-borde bg-superficie px-4 text-lg text-tinta ' +
  'focus:border-oro focus:outline-none';

/** Campo de fecha: con letra muy grande en un teléfono angosto, la fecha se achica hasta caber junto
 * al ícono del calendario. */
export const claseCampoFecha = `${claseCampo} text-[min(1.125rem,5.4vw)]`;

/** Campo para un número grande (minutos, cantidad): hundido en el fondo y con borde marcado, para que
 * se vea como un lugar a completar aunque esté vacío. */
export const claseCampoNumero =
  'block w-full min-w-0 min-h-[4rem] rounded-2xl border-2 border-tenue bg-fondo px-4 text-center text-tinta ' +
  'font-serif text-[2rem] font-semibold tabular-nums focus:border-oro focus:outline-none';

export const claseOpcion =
  'flex min-h-[3rem] cursor-pointer items-center gap-3 rounded-2xl border-2 border-borde bg-superficie px-4 py-2 ' +
  'min-w-0 hyphens-auto [overflow-wrap:anywhere] ' +
  'has-checked:border-oro has-checked:bg-resalte has-checked:font-semibold';
