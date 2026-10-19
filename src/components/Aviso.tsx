import type { ReactNode } from 'react';

/** Mensaje destacado pero sereno: sin colores de alarma. */
export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="space-y-3 rounded-2xl border-2 border-acento bg-aviso p-4">
      {children}
    </div>
  );
}
