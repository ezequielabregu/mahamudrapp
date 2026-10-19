import { describe, expect, it } from 'vitest';
import { esCantidadValida, sumarConteos, type MovimientoConteo } from './conteos';

const conteos: MovimientoConteo[] = [
  { practica: 'postraciones', cantidad: 100, fechaLocal: '2026-10-14' },
  { practica: 'postraciones', cantidad: 50, fechaLocal: '2026-10-15' },
  { practica: 'postraciones', cantidad: -20, fechaLocal: '2026-10-15' },
  { practica: 'chenresi', cantidad: 300, fechaLocal: '2026-10-15' },
  { practica: 'postraciones', cantidad: 30, fechaLocal: '2027-01-14' },
];

describe('sumarConteos', () => {
  it('suma todo sin filtro, restando las correcciones', () => {
    expect(sumarConteos(conteos)).toBe(460);
  });

  it('filtra por práctica y por rango con fin exclusivo', () => {
    expect(sumarConteos(conteos, { practica: 'postraciones' })).toBe(160);
    expect(
      sumarConteos(conteos, { practica: 'postraciones', desde: '2026-10-14', hasta: '2027-01-14' }),
    ).toBe(130);
    expect(sumarConteos(conteos, { desde: '2026-10-15', hasta: '2026-10-16' })).toBe(330);
  });
});

describe('esCantidadValida', () => {
  it('acepta enteros distintos de cero', () => {
    expect(esCantidadValida(1)).toBe(true);
    expect(esCantidadValida(-20)).toBe(true);
  });

  it('rechaza cero, decimales y valores absurdos', () => {
    expect(esCantidadValida(0)).toBe(false);
    expect(esCantidadValida(1.5)).toBe(false);
    expect(esCantidadValida(Number.NaN)).toBe(false);
    expect(esCantidadValida(5_000_000)).toBe(false);
  });
});
