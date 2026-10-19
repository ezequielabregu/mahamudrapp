import { describe, expect, it } from 'vitest';
import { metasDelNivel, practicasDelNivel } from './niveles';
import { programa } from './programa';

describe('metasDelNivel', () => {
  it('en el nivel 1 la meta del preliminar depende del compromiso', () => {
    expect(metasDelNivel(1, 'completo', programa)).toEqual({
      preliminarTrimestre: 10000,
      chenresiAnual: 100000,
      yidam: null,
    });
    expect(metasDelNivel(1, 'medio', programa).preliminarTrimestre).toBe(5000);
    expect(metasDelNivel(1, 'minimo', programa).preliminarTrimestre).toBe(0);
  });

  it('en los niveles 2 y 3 son 10.000 de cada preliminar, sin importar el compromiso', () => {
    expect(metasDelNivel(2, 'minimo', programa).preliminarTrimestre).toBe(10000);
    expect(metasDelNivel(3, 'medio', programa)).toMatchObject({
      preliminarTrimestre: 10000,
      chenresiAnual: 100000,
    });
  });

  it('en los niveles de yidam Chenresi es optativo y se cuenta el millón de mantras', () => {
    expect(metasDelNivel(4, 'completo', programa)).toEqual({
      preliminarTrimestre: 0,
      chenresiAnual: null,
      yidam: { practica: 'yidam-exterior', meta: 1000000 },
    });
    expect(metasDelNivel(5, 'completo', programa).yidam?.practica).toBe('yidam-interior');
  });

  it('en el nivel 6 los preliminares ya no forman parte del compromiso', () => {
    expect(metasDelNivel(6, 'completo', programa)).toMatchObject({
      preliminarTrimestre: null,
      yidam: { practica: 'yidam-secreto', meta: 1000000 },
    });
  });
});

describe('practicasDelNivel', () => {
  it('no muestra prácticas de yidam en el nivel 1', () => {
    expect(practicasDelNivel(1, programa)).toEqual([
      'postraciones',
      'vajrasattva',
      'mandala',
      'guruyoga',
      'chenresi',
    ]);
  });

  it('suma solo el yidam del nivel', () => {
    expect(practicasDelNivel(5, programa)).toContain('yidam-interior');
    expect(practicasDelNivel(5, programa)).not.toContain('yidam-exterior');
  });
});
