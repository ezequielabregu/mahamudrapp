import { describe, expect, it } from 'vitest';
import type { Conteo, Sesion } from '../db/schema';
import { cantidadConPractica, contadoEnElDia, historialPorDia, practicasConRegistros } from './historial';
import { programa, type Practica } from './programa';

const sesion = (id: string, fechaLocal: string, minutos: number, extra: Partial<Sesion> = {}): Sesion => ({
  id,
  tipo: 'shine',
  origen: 'app',
  fechaLocal,
  duracionSeg: minutos * 60,
  diaSemana: 0,
  pasosCompletados: [],
  creadoEn: `${fechaLocal}T07:00:00.000-03:00`,
  dispositivoId: 'prueba',
  version: 1,
  ...extra,
});

const conteo = (
  id: string,
  practica: Practica,
  fechaLocal: string,
  cantidad: number,
  hora = '19:00',
  extra: Partial<Conteo> = {},
): Conteo => ({
  id,
  practica,
  cantidad,
  origen: 'contador',
  fechaLocal,
  creadoEn: `${fechaLocal}T${hora}:00.000-03:00`,
  dispositivoId: 'prueba',
  version: 1,
  ...extra,
});

describe('historialPorDia', () => {
  const sesiones = [sesion('s1', '2026-11-15', 30), sesion('s2', '2026-11-16', 35)];
  const conteos = [
    conteo('c1', 'postraciones', '2026-11-16', 60, '19:30'),
    conteo('c2', 'vajrasattva', '2026-11-15', 1080, '20:30', { origen: 'manual' }),
    conteo('c3', 'postraciones', '2026-11-15', -10, '21:00', { origen: 'correccion' }),
  ];

  it('agrupa por día, del más reciente al más viejo, y dentro del día en el orden en que se registró', () => {
    const dias = historialPorDia(sesiones, conteos);
    expect(dias.map((d) => d.fecha)).toEqual(['2026-11-16', '2026-11-15']);
    expect(dias[0]!.lineas.map((l) => l.id)).toEqual(['s2', 'c1']);
    expect(dias[1]!.lineas.map((l) => l.id)).toEqual(['s1', 'c2', 'c3']);
  });

  it('muestra cada registro tal cual: minutos de la sesión y correcciones con su signo', () => {
    const [, ayer] = historialPorDia(sesiones, conteos);
    expect(ayer!.lineas[0]).toMatchObject({ clase: 'sesion', minutos: 30, origen: 'app' });
    expect(ayer!.lineas[2]).toMatchObject({ clase: 'conteo', cantidad: -10, origen: 'correccion' });
  });

  it('filtra por una práctica', () => {
    const dias = historialPorDia(sesiones, conteos, 'vajrasattva');
    expect(dias).toHaveLength(1);
    expect(dias[0]!.lineas.map((l) => l.id)).toEqual(['c2']);
  });

  it('el filtro Shiné deja solo las sesiones de Shiné', () => {
    const conPreliminar = [...sesiones, sesion('s3', '2026-11-16', 20, { tipo: 'preliminar' })];
    const dias = historialPorDia(conPreliminar, conteos, 'shine');
    expect(dias.flatMap((d) => d.lineas.map((l) => l.id))).toEqual(['s2', 's1']);
  });

  it('sin registros no hay días', () => {
    expect(historialPorDia([], [])).toEqual([]);
  });
});

describe('practicasConRegistros', () => {
  it('devuelve las prácticas con algún conteo, en el orden del programa', () => {
    const conteos = [
      conteo('a', 'chenresi', '2026-11-16', 300),
      conteo('b', 'vajrasattva', '2026-11-15', 1080),
      conteo('c', 'postraciones', '2026-11-14', 50),
      conteo('d', 'chenresi', '2026-11-13', 100),
    ];
    expect(practicasConRegistros(conteos)).toEqual(['postraciones', 'vajrasattva', 'chenresi']);
  });
});

describe('contadoEnElDia', () => {
  it('suma por práctica lo de ese día, con las correcciones', () => {
    const conteos = [
      conteo('a', 'postraciones', '2026-11-14', 50),
      conteo('b', 'postraciones', '2026-11-14', -10),
      conteo('c', 'chenresi', '2026-11-14', 216),
      conteo('d', 'postraciones', '2026-11-13', 70),
    ];
    expect(contadoEnElDia(conteos, '2026-11-14')).toEqual([
      { practica: 'postraciones', total: 40 },
      { practica: 'chenresi', total: 216 },
    ]);
  });

  it('no muestra una práctica que en el día suma cero', () => {
    const conteos = [conteo('a', 'mandala', '2026-11-14', 10), conteo('b', 'mandala', '2026-11-14', -10)];
    expect(contadoEnElDia(conteos, '2026-11-14')).toEqual([]);
  });
});

describe('cantidadConPractica', () => {
  it('escribe la cantidad con el nombre de la práctica', () => {
    expect(cantidadConPractica(1080, 'vajrasattva', programa)).toBe('1.080 mantras de Vajrasattva');
    expect(cantidadConPractica(45, 'postraciones', programa)).toBe('45 postraciones');
  });
});
