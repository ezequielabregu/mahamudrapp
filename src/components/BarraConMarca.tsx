import { formatearNumero } from '../domain/formato';

interface Props {
  titulo: string;
  valor: number;
  meta: number;
  /** Dónde estaría hoy un ritmo parejo hasta la meta. Se dibuja como una marca vertical. */
  parejo: number;
  /** Período de la meta: "del trimestre", "del año". */
  periodo: string;
}

/**
 * Barra con marca (bullet chart): la barra es lo hecho, la marca es el ritmo parejo a hoy.
 * Se lee de un vistazo si se va por delante o por detrás, y el texto dice los mismos números.
 */
export function BarraConMarca({ titulo, valor, meta, parejo, periodo }: Props) {
  const porcentaje = (n: number) => Math.min(100, Math.max(0, (n / meta) * 100));
  const hecho = porcentaje(valor);
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold">{titulo}</span>
        <span className="text-tenue">
          <span className="font-semibold text-tinta">{Math.round(hecho)}%</span> de la meta {periodo}
        </span>
      </p>
      <div
        role="img"
        aria-label={`${titulo}: ${formatearNumero(valor)} de ${formatearNumero(meta)}. Un ritmo parejo llevaría hoy ${formatearNumero(parejo)}.`}
        className="relative h-4"
      >
        <div className="absolute inset-y-1 right-0 left-0 overflow-hidden rounded-full bg-pista">
          <div
            className="h-full rounded-full bg-oro"
            style={{ width: valor > 0 ? `max(${hecho}%, 0.5rem)` : '0%' }}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-full bg-tinta"
          style={{ left: `${porcentaje(parejo)}%` }}
        />
      </div>
      <p className="text-tenue">
        {formatearNumero(valor)} de {formatearNumero(meta)} · ritmo parejo a hoy: {formatearNumero(parejo)}
      </p>
    </div>
  );
}
