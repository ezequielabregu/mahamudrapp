import { describe, expect, it } from 'vitest';
import { programa } from './programa';
import { rangoDelTrimestre, semanaDelTrimestre } from './semana';

describe('semanaDelTrimestre', () => {
  it('arma el 1º trimestre como el cuadernillo, de lunes a domingo', () => {
    const semana = semanaDelTrimestre(1, programa);
    expect(semana.preliminar).toBe('postraciones');
    expect(semana.dias.map((d) => d.nombre)).toEqual([
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ]);
    expect(semana.dias[0]).toMatchObject({
      reflexion: { titulo: 'La preciosa existencia humana' },
      soporte: { titulo: '7 veces 21 respiraciones' },
    });
    expect(semana.dias[2]?.soporte.titulo).toBe('Soporte exterior impuro de pequeño tamaño');
  });

  it('en el 4º trimestre el lunes es sin soporte y el martes, respiraciones', () => {
    const semana = semanaDelTrimestre(4, programa);
    expect(semana.preliminar).toBe('guruyoga');
    expect(semana.dias[0]?.soporte.titulo).toBe('Shiné sin soporte (o lhaktong)');
    expect(semana.dias[1]?.soporte.titulo).toBe('7 veces 21 respiraciones');
  });
});

describe('rangoDelTrimestre', () => {
  it('da el primer y el último día de cada trimestre', () => {
    expect(rangoDelTrimestre('2026-10-14', 1, programa)).toEqual({
      desde: '2026-10-14',
      hasta: '2027-01-13',
    });
    expect(rangoDelTrimestre('2026-10-14', 4, programa)).toEqual({
      desde: '2027-07-14',
      hasta: '2027-10-13',
    });
  });
});
