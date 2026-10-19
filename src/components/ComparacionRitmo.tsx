import { formatearNumero } from '../domain/formato';

interface Props {
  titulo: string;
  valor: number;
  meta: number;
  /** Lo que llevaría hoy un ritmo parejo hasta la meta. */
  parejo: number;
  /** Período de la meta: "del trimestre", "del año". */
  periodo: string;
}

/**
 * ¿Voy al día? Dos barras con la misma escala: lo hecho y lo que llevaría hoy un ritmo
 * parejo hasta la meta. Al principio del período ambos son chicos frente a la meta total,
 * así que la escala es la mayor de las dos y las barras se leen bien desde el primer día.
 * Rótulos y valores en texto, al lado de cada barra.
 */
export function ComparacionRitmo({ titulo, valor, meta, parejo, periodo }: Props) {
  const escala = Math.max(valor, parejo, 1);
  const filas = [
    { etiqueta: 'Hecho', valor, clase: 'bg-oro' },
    { etiqueta: 'Ritmo parejo a hoy', valor: parejo, clase: 'bg-calor-1' },
  ];
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold">{titulo}</span>
        <span className="text-tenue">
          <span className="font-semibold text-tinta">{Math.round((valor / meta) * 100)}%</span> de{' '}
          {formatearNumero(meta)} {periodo}
        </span>
      </p>
      <dl
        className="space-y-1.5"
        aria-label={`${titulo}: hecho ${formatearNumero(valor)}, ritmo parejo a hoy ${formatearNumero(parejo)}`}
      >
        {filas.map((f) => (
          <div key={f.etiqueta}>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-tenue">{f.etiqueta}</dt>
              <dd className="font-semibold">{formatearNumero(f.valor)}</dd>
            </div>
            <div aria-hidden="true" className="mt-1 h-3 overflow-hidden rounded-full bg-pista">
              <div
                className={`h-full rounded-full ${f.clase}`}
                style={{ width: f.valor > 0 ? `max(${(f.valor / escala) * 100}%, 0.75rem)` : '0%' }}
              />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
