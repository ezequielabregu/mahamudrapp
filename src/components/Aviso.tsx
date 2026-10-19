import type { ReactNode } from 'react';

/** Mensaje destacado pero sereno: sin colores de alarma. */
export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="space-y-3 rounded-3xl border border-oro/40 bg-aviso p-5">
      {children}
    </div>
  );
}
