interface Props {
  texto: string;
  hecho?: boolean;
}

/** Estado breve en forma de píldora: "Pendiente", "Hecha · 30 minutos", "Hoy: 25". */
export function Insignia({ texto, hecho = false }: Props) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-semibold whitespace-nowrap ' +
        (hecho ? 'border-hecho text-hecho' : 'border-borde text-tenue')
      }
    >
      {hecho && <span aria-hidden="true">✓</span>}
      {texto}
    </span>
  );
}
