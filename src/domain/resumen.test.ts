import { describe, expect, it } from 'vitest';
import { infoDelDia } from './calendario';
import { programa } from './programa';
import { debeRecordarRespaldo, resumirDia } from './resumen';

describe('resumirDia', () => {
  const info = infoDelDia('2026-10-18', '2026-10-14', programa)!;

  it('resume sesiones y conteos del día, del trimestre y del año', () => {
    const resumen = resumirDia(
      info,
      [
        { tipo: 'shine', fechaLocal: '2026-10-18', duracionSeg: 1800 },
        { tipo: 'shine', fechaLocal: '2026-10-18', duracionSeg: 600 },
        { tipo: 'shine', fechaLocal: '2026-10-17', duracionSeg: 1800 },
        { tipo: 'preliminar', fechaLocal: '2026-10-18', duracionSeg: 1200 },
      ],
      [
        { practica: 'postraciones', cantidad: 50, fechaLocal: '2026-10-17' },
        { practica: 'postraciones', cantidad: 30, fechaLocal: '2026-10-18' },
        { practica: 'postraciones', cantidad: -5, fechaLocal: '2026-10-18' },
        { practica: 'chenresi', cantidad: 300, fechaLocal: '2026-10-15' },
        { practica: 'chenresi', cantidad: 100, fechaLocal: '2026-10-18' },
      ],
      { preliminarTrimestre: 10000, chenresiAnual: 100000 },
    );

    expect(resumen.shine).toEqual({ sesiones: 2, segundos: 2400 });
    expect(resumen.preliminar).toEqual({
      practica: 'postraciones',
      hoy: 25,
      trimestre: 75,
      metaTrimestre: 10000,
      metaDiaria: 109,
    });
    expect(resumen.chenresi).toEqual({ hoy: 100, anio: 400, metaAnio: 100000 });
  });
});

describe('debeRecordarRespaldo', () => {
  it('no molesta si todavía no hay nada que respaldar', () => {
    expect(debeRecordarRespaldo(undefined, '2026-10-18', false)).toBe(false);
  });

  it('recuerda si nunca se hizo una copia o pasaron más de 7 días', () => {
    expect(debeRecordarRespaldo(undefined, '2026-10-18', true)).toBe(true);
    expect(debeRecordarRespaldo('2026-10-11', '2026-10-18', true)).toBe(false);
    expect(debeRecordarRespaldo('2026-10-10', '2026-10-18', true)).toBe(true);
  });
});
