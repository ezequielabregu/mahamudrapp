import { describe, expect, it } from 'vitest';
import { infoDelDia } from './calendario';
import { programa } from './programa';
import { explicacionDelPaso, guiaPreliminar, guiaShine, pasosDelDia, textoPagina } from './sesiones';

const INICIO = '2026-10-14';
const ids = (fecha: string) => pasosDelDia(guiaShine, infoDelDia(fecha, INICIO, programa)!).map((p) => p.id);

describe('pasosDelDia (Shiné)', () => {
  it('sigue el orden del cuadernillo un día con soporte', () => {
    // Lunes del 1º trimestre: 7 veces 21 respiraciones.
    expect(ids('2026-10-19')).toEqual([
      'expulsiones',
      'refugio',
      'linaje',
      'reflexion',
      'shine',
      'dedicacion',
    ]);
  });

  it('agrega la Invocación a Milarepa entre la reflexión y el shiné sin soporte', () => {
    // Domingo del 1º trimestre: shiné sin soporte.
    expect(ids('2026-10-18')).toEqual([
      'expulsiones',
      'refugio',
      'linaje',
      'reflexion',
      'milarepa',
      'shine',
      'dedicacion',
    ]);
  });

  it('en el 2º trimestre el viernes también lleva Milarepa', () => {
    // 2027-01-15 es viernes, sin soporte en el 2º trimestre.
    expect(ids('2027-01-15')).toContain('milarepa');
  });
});

describe('guiaPreliminar', () => {
  it('tiene la sesión de postraciones en orden', () => {
    expect(guiaPreliminar('postraciones')?.pasos.map((p) => p.id)).toEqual([
      'expulsiones',
      'preocupaciones',
      'visualizacion',
      'postraciones',
      'voto',
      'disolucion',
      'dedicacion',
    ]);
  });

  it('no inventa las sesiones que todavía no se cargaron', () => {
    expect(guiaPreliminar('vajrasattva')).toBeUndefined();
  });
});

describe('textoPagina', () => {
  it('cita una página o un rango', () => {
    expect(textoPagina({ pagina: 8 })).toBe('libro, p. 8');
    expect(textoPagina({ pagina: 72, paginaFin: 73 })).toBe('libro, pp. 72 y 73');
    expect(textoPagina({})).toBeNull();
  });
});

describe('explicacionDelPaso', () => {
  const paso = (id: string) => guiaShine.pasos.find((p) => p.id === id)!;

  it('pone primero los minutos sugeridos y después la explicación', () => {
    const info = infoDelDia('2026-10-18', INICIO, programa)!;
    const texto = explicacionDelPaso(paso('reflexion'), info);
    expect(texto[0]).toMatch(/5 minutos/);
    expect(texto).toHaveLength(2);
  });

  it('los días de bodhicitta suma la sugerencia de tong-len', () => {
    // 2026-10-20 es martes.
    const info = infoDelDia('2026-10-20', INICIO, programa)!;
    expect(explicacionDelPaso(paso('reflexion'), info).at(-1)).toMatch(/tong-len/);
  });

  it('con las respiraciones suma la nota del soporte', () => {
    // 2026-10-19 es lunes: 7 veces 21 respiraciones.
    const info = infoDelDia('2026-10-19', INICIO, programa)!;
    expect(explicacionDelPaso(paso('shine'), info).at(-1)).toMatch(/orientativas/);
  });

  it('un paso sin explicación no devuelve nada', () => {
    const info = infoDelDia('2026-10-19', INICIO, programa)!;
    expect(explicacionDelPaso(paso('linaje'), info)).toEqual([]);
  });
});
