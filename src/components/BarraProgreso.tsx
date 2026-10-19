interface Props {
  valor: number;
  maximo: number;
  etiqueta: string;
  /** Sobre la banda granate se usa el oro claro; en las tarjetas, el oro. */
  enBanda?: boolean;
}

/** Barra fina de avance. No es interactiva: solo acompaña al número escrito. */
export function BarraProgreso({ valor, maximo, etiqueta, enBanda = false }: Props) {
  const porcentaje = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={valor}
      className={`h-1.5 w-full overflow-hidden rounded-full ${enBanda ? 'bg-white/15' : 'bg-pista'}`}
    >
      <div
        className={`h-full rounded-full ${enBanda ? 'bg-oro-claro' : 'bg-oro'}`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}
