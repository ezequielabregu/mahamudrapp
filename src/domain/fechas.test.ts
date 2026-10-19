import { describe, expect, it } from 'vitest';
import { diaDeSemana, diasEntre, esFechaValida, fechaLocalDe, sumarDias, sumarMeses } from './fechas';

describe('fechas', () => {
  it('arma la fecha local del dispositivo', () => {
    expect(fechaLocalDe(new Date(2026, 9, 14, 23, 59))).toBe('2026-10-14');
    expect(fechaLocalDe(new Date(2026, 9, 15, 0, 1))).toBe('2026-10-15');
  });

  it('valida fechas, incluidos los bisiestos', () => {
    expect(esFechaValida('2028-02-29')).toBe(true);
    expect(esFechaValida('2027-02-29')).toBe(false);
    expect(esFechaValida('2026-13-01')).toBe(false);
    expect(esFechaValida('18/10/2026')).toBe(false);
  });

  it('cuenta días sin que lo afecten los cambios de horario', () => {
    expect(diasEntre('2026-10-14', '2027-01-14')).toBe(92);
    expect(diasEntre('2027-03-01', '2027-04-01')).toBe(31);
    expect(diasEntre('2028-02-28', '2028-03-01')).toBe(2);
  });

  it('suma días y meses', () => {
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarMeses('2026-10-14', 3)).toBe('2027-01-14');
    expect(sumarMeses('2026-11-30', 3)).toBe('2027-02-28');
    expect(sumarMeses('2027-11-30', 3)).toBe('2028-02-29');
  });

  it('calcula el día de la semana (0 = domingo)', () => {
    expect(diaDeSemana('2026-10-18')).toBe(0);
    expect(diaDeSemana('2026-10-14')).toBe(3);
  });
});
