import { describe, expect, it } from 'vitest';
import { infoDelDia, metaDiariaSugerida } from './calendario';
import { programa } from './programa';

const INICIO = '2026-10-14';

describe('infoDelDia', () => {
  it('no devuelve nada antes del inicio del programa', () => {
    expect(infoDelDia('2026-10-13', INICIO, programa)).toBeNull();
  });

  it('el primer día es el día 1 del 1º trimestre', () => {
    const info = infoDelDia(INICIO, INICIO, programa);
    expect(info).toMatchObject({
      anioPractica: 1,
      trimestre: 1,
      diaDelTrimestre: 1,
      diasDelTrimestre: 92,
      inicioTrimestre: '2026-10-14',
      finTrimestre: '2027-01-14',
      preliminar: 'postraciones',
      nombreDia: 'miercoles',
      reflexionId: 'muerte',
      soporteId: 'objeto-pequeno',
    });
  });

  it('el domingo del 1º trimestre toca samsara y shiné sin soporte', () => {
    const info = infoDelDia('2026-10-18', INICIO, programa);
    expect(info?.reflexionId).toBe('samsara');
    expect(info?.soporteId).toBe('sin-soporte');
    expect(info?.diaDelTrimestre).toBe(5);
  });

  it('cambia de trimestre en el día exacto', () => {
    expect(infoDelDia('2027-01-13', INICIO, programa)?.trimestre).toBe(1);
    const segundo = infoDelDia('2027-01-14', INICIO, programa);
    expect(segundo?.trimestre).toBe(2);
    expect(segundo?.preliminar).toBe('vajrasattva');
    expect(segundo?.diaDelTrimestre).toBe(1);
    expect(infoDelDia('2027-04-14', INICIO, programa)?.trimestre).toBe(3);
    expect(infoDelDia('2027-07-14', INICIO, programa)?.trimestre).toBe(4);
  });

  it('el viernes del 2º trimestre es sin soporte', () => {
    // 2027-01-15 es viernes.
    expect(infoDelDia('2027-01-15', INICIO, programa)?.soporteId).toBe('sin-soporte');
  });

  it('empieza el segundo año en la misma fecha de inicio', () => {
    expect(infoDelDia('2027-10-13', INICIO, programa)).toMatchObject({ anioPractica: 1, trimestre: 4 });
    expect(infoDelDia('2027-10-14', INICIO, programa)).toMatchObject({
      anioPractica: 2,
      trimestre: 1,
      inicioAnio: '2027-10-14',
      finAnio: '2028-10-14',
    });
  });

  it('cuenta bien los días de un trimestre con 29 de febrero', () => {
    // Año 2: 2º trimestre del 2028-01-14 al 2028-04-14, incluye el 29 de febrero.
    const info = infoDelDia('2028-02-29', INICIO, programa);
    expect(info?.trimestre).toBe(2);
    expect(info?.diasDelTrimestre).toBe(91);
  });

  it('funciona muchos años después', () => {
    expect(infoDelDia('2040-10-14', INICIO, programa)?.anioPractica).toBe(15);
  });

  it('ajusta inicios a fin de mes', () => {
    const info = infoDelDia('2027-02-28', '2026-11-30', programa);
    expect(info?.trimestre).toBe(2);
    expect(info?.inicioTrimestre).toBe('2027-02-28');
  });
});

describe('metaDiariaSugerida', () => {
  it('reparte la meta del trimestre redondeando hacia arriba', () => {
    expect(metaDiariaSugerida(10000, 92)).toBe(109);
    expect(metaDiariaSugerida(5000, 92)).toBe(55);
  });

  it('no sugiere nada con compromiso mínimo', () => {
    expect(metaDiariaSugerida(0, 92)).toBeNull();
  });
});
