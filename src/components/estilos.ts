export type VarianteBoton = 'principal' | 'secundario';

const base =
  'inline-flex items-center justify-center rounded-2xl px-5 text-center font-semibold ' +
  'disabled:opacity-40 disabled:cursor-not-allowed select-none';

const variantes: Record<VarianteBoton, string> = {
  principal: 'min-h-[4rem] bg-acento text-sobre-acento text-lg',
  secundario: 'min-h-[3rem] border-2 border-acento text-acento bg-transparent',
};

/** Áreas táctiles: 3rem = 60 px y 4rem = 80 px con el tamaño base de 20 px. */
export function clasesBoton(variante: VarianteBoton = 'secundario', ancho = 'w-full'): string {
  return `${base} ${ancho} ${variantes[variante]}`;
}

export const claseCampo =
  'block w-full min-w-0 min-h-[3rem] rounded-xl border-2 border-borde bg-superficie px-4 text-lg text-tinta';

export const claseOpcion =
  'flex min-h-[3rem] cursor-pointer items-center gap-3 rounded-xl border-2 border-borde bg-superficie px-4 py-2 ' +
  'has-checked:border-acento has-checked:font-semibold';
