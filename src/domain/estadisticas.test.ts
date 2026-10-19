import { describe, expect, it } from 'vitest';
import type { MovimientoConteo } from './conteos';
import {
  inicioDeSemana,
  mejorDia,
  resumenMeditacion,
  ritmoParejo,
  totalesPorDia,
  minutosPorSemana,
  proyeccion,
  rachas,
  regularidad,
  resumenCarnet,
} from './estadisticas';
import type { SesionResumible } from './resumen';

const shine = (fechaLocal: string, minutos = 30): SesionResumible => ({
  tipo: 'shine',
  fechaLocal,
  duracionSeg: minutos * 60,
});

describe('regularidad', () => {
  it('cuenta días con Shiné sobre los días del período, sin duplicar días', () => {
    const sesiones = [shine('2026-10-14'), shine('2026-10-14'), shine('2026-10-16')];
    expect(regularidad(sesiones, '2026-10-14', '2026-10-18')).toEqual({
      dias: 5,
      practicados: 2,
      porcentaje: 40,
    });
  });

  it('ignora las sesiones de preliminares', () => {
    const sesiones: SesionResumible[] = [{ tipo: 'preliminar', fechaLocal: '2026-10-14', duracionSeg: 600 }];
    expect(regularidad(sesiones, '2026-10-14', '2026-10-14').practicados).toBe(0);
  });

  it('coincide con el ejemplo de la Lama: 365 días con 10 sin practicar dan 97%', () => {
    const sesiones: SesionResumible[] = [];
    for (let i = 0; i < 355; i++) {
      const d = new Date(Date.UTC(2026, 9, 14 + i));
      sesiones.push(shine(d.toISOString().slice(0, 10)));
    }
    expect(regularidad(sesiones, '2026-10-14', '2027-10-13').porcentaje).toBe(97);
  });
});

describe('rachas', () => {
  const sesiones = [
    shine('2026-10-14'),
    shine('2026-10-15'),
    shine('2026-10-16'),
    shine('2026-10-17'),
    shine('2026-10-20'),
    shine('2026-10-21'),
  ];

  it('la racha actual llega hasta hoy', () => {
    expect(rachas([...sesiones, shine('2026-10-22')], '2026-10-22')).toEqual({ actual: 3, maxima: 4 });
  });

  it('si hoy todavía no hubo sesión, la racha sigue viva desde ayer', () => {
    expect(rachas(sesiones, '2026-10-22')).toEqual({ actual: 2, maxima: 4 });
  });

  it('se corta si ayer no hubo sesión', () => {
    expect(rachas(sesiones, '2026-10-23').actual).toBe(0);
  });
});

describe('minutosPorSemana', () => {
  it('agrupa por semanas de lunes a domingo, de la más vieja a la actual', () => {
    expect(inicioDeSemana('2026-10-18')).toBe('2026-10-12');
    expect(inicioDeSemana('2026-10-19')).toBe('2026-10-19');
    const semanas = minutosPorSemana(
      [shine('2026-10-14', 30), shine('2026-10-18', 45), shine('2026-10-19', 20)],
      '2026-10-20',
      3,
    );
    expect(semanas).toEqual([
      { inicio: '2026-10-05', minutos: 0 },
      { inicio: '2026-10-12', minutos: 75 },
      { inicio: '2026-10-19', minutos: 20 },
    ]);
  });
});

describe('proyeccion', () => {
  it('proyecta al ritmo actual y calcula lo que falta por día', () => {
    // Día 10 de 92, con 500 hechas y meta 10.000: faltan 9.500 en 83 días (hoy incluido).
    expect(proyeccion(500, 10000, 10, 92)).toEqual({ ritmoDiario: 50, proyectado: 4600, faltanPorDia: 115 });
  });

  it('sin meta o con la meta cumplida no pide nada por día', () => {
    expect(proyeccion(500, 0, 10, 92).faltanPorDia).toBeNull();
    expect(proyeccion(10000, 10000, 80, 92).faltanPorDia).toBeNull();
  });
});

describe('resumenCarnet', () => {
  const conteos: MovimientoConteo[] = [
    { practica: 'postraciones', cantidad: 7000, fechaLocal: '2027-01-10' },
    { practica: 'chenresi', cantidad: 80000, fechaLocal: '2027-05-01' },
    { practica: 'postraciones', cantidad: 12000, fechaLocal: '2027-11-01' },
    { practica: 'chenresi', cantidad: 3000, fechaLocal: '2027-11-02' },
  ];

  it('da una fila por año: Chenresi por año y preliminares acumulados, como el carnet', () => {
    const filas = resumenCarnet([shine('2027-10-14')], conteos, '2026-10-14', '2027-11-05');
    expect(filas).toHaveLength(2);
    expect(filas[0]).toMatchObject({ etiqueta: '2026-27', enCurso: false, chenresi: 80000 });
    expect(filas[0]?.preliminares.postraciones).toBe(7000);
    expect(filas[1]).toMatchObject({ etiqueta: '2027-28', enCurso: true, chenresi: 3000 });
    // El ejemplo del cuadernillo: 7.000 el 1º año y 12.000 el 2º se anotan como 19.000.
    expect(filas[1]?.preliminares.postraciones).toBe(19000);
  });

  it('en el año en curso, la meditación se calcula sobre los días transcurridos', () => {
    const filas = resumenCarnet([shine('2027-10-14'), shine('2027-10-15')], [], '2026-10-14', '2027-10-17');
    expect(filas[1]?.meditacion).toBe(50);
  });

  it('antes del inicio no hay filas', () => {
    expect(resumenCarnet([], [], '2026-10-14', '2026-10-01')).toEqual([]);
  });
});

describe('ritmoParejo', () => {
  it('reparte la meta en partes iguales por día', () => {
    expect(ritmoParejo(10000, 46, 92)).toBe(5000);
    expect(ritmoParejo(10000, 5, 92)).toBe(543);
    expect(ritmoParejo(0, 5, 92)).toBe(0);
    expect(ritmoParejo(100, 120, 92)).toBe(100);
  });
});

describe('totalesPorDia y mejorDia', () => {
  const conteos: MovimientoConteo[] = [
    { practica: 'postraciones', cantidad: 40, fechaLocal: '2026-10-16' },
    { practica: 'postraciones', cantidad: 30, fechaLocal: '2026-10-18' },
    { practica: 'postraciones', cantidad: 25, fechaLocal: '2026-10-18' },
    { practica: 'postraciones', cantidad: -5, fechaLocal: '2026-10-18' },
    { practica: 'chenresi', cantidad: 500, fechaLocal: '2026-10-17' },
  ];

  it('da el total de cada día, con las correcciones restadas', () => {
    expect(totalesPorDia(conteos, 'postraciones', '2026-10-18', 3)).toEqual([
      { fecha: '2026-10-16', total: 40 },
      { fecha: '2026-10-17', total: 0 },
      { fecha: '2026-10-18', total: 50 },
    ]);
  });

  it('encuentra el día con más cantidad', () => {
    expect(mejorDia(conteos, 'postraciones', '2026-10-14', '2026-10-19')).toEqual({
      fecha: '2026-10-18',
      total: 50,
    });
    expect(mejorDia(conteos, 'mandala', '2026-10-14', '2026-10-19')).toBeNull();
  });
});

describe('resumenMeditacion', () => {
  it('suma sesiones y minutos y saca promedios por sesión y por día', () => {
    const sesiones = [shine('2026-10-14', 30), shine('2026-10-14', 10), shine('2026-10-16', 50)];
    expect(resumenMeditacion(sesiones, '2026-10-14', '2026-10-18')).toEqual({
      sesiones: 3,
      minutos: 90,
      promedioPorSesion: 30,
      promedioPorDia: 18,
    });
  });
});
