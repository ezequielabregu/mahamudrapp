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
  // Con poco avance contra una meta grande (3 de 10.000) el relleno no llegaría a un píxel:
  // todo avance mayor que cero se ve al menos como un tramo corto.
  const ancho = valor > 0 ? `max(${porcentaje}%, 0.6rem)` : '0%';
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={valor}
      className={`h-2 w-full overflow-hidden rounded-full ${enBanda ? 'bg-white/15' : 'bg-pista'}`}
    >
      <div
        className={`h-full rounded-full ${enBanda ? 'bg-oro-claro' : 'bg-oro'}`}
        style={{ width: ancho }}
      />
    </div>
  );
}
