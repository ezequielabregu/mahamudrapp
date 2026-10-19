import { describe, expect, it } from 'vitest';
import { estadoTemporizador, formatearReloj, minutosValidos } from './temporizador';

describe('estadoTemporizador', () => {
  const inicio = 1_000_000;

  it('al empezar no transcurrió nada', () => {
    expect(estadoTemporizador(inicio, 1800, inicio)).toEqual({
      transcurridoSeg: 0,
      restanteSeg: 1800,
      fraccion: 0,
      terminado: false,
    });
  });

  it('calcula por marcas de tiempo, no por ticks', () => {
    expect(estadoTemporizador(inicio, 1800, inicio + 900_500)).toMatchObject({
      transcurridoSeg: 900,
      restanteSeg: 900,
      fraccion: 0.5,
      terminado: false,
    });
  });

  it('termina justo al cumplirse el tiempo, y no pasa del total si se vuelve tarde', () => {
    expect(estadoTemporizador(inicio, 1800, inicio + 1_800_000).terminado).toBe(true);
    expect(estadoTemporizador(inicio, 1800, inicio + 5_000_000)).toMatchObject({
      transcurridoSeg: 1800,
      restanteSeg: 0,
      fraccion: 1,
      terminado: true,
    });
  });

  it('si el reloj del teléfono retrocede, no da tiempos negativos', () => {
    expect(estadoTemporizador(inicio, 1800, inicio - 5000).transcurridoSeg).toBe(0);
  });
});

describe('formatearReloj', () => {
  it('muestra minutos y segundos, y horas si hacen falta', () => {
    expect(formatearReloj(1800)).toBe('30:00');
    expect(formatearReloj(65)).toBe('1:05');
    expect(formatearReloj(0)).toBe('0:00');
    expect(formatearReloj(3900)).toBe('1:05:00');
  });
});

describe('minutosValidos', () => {
  it('acepta de 1 a 180 minutos enteros', () => {
    expect(minutosValidos(30)).toBe(true);
    expect(minutosValidos(0)).toBe(false);
    expect(minutosValidos(181)).toBe(false);
    expect(minutosValidos(12.5)).toBe(false);
  });
});
