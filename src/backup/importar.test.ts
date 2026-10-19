import { describe, expect, it } from 'vitest';
import { borradorComoConteo, leerCopia } from './importar';

const sesion = {
  id: 's1',
  tipo: 'shine',
  origen: 'app',
  fechaLocal: '2026-10-18',
  duracionSeg: 1800,
  diaSemana: 0,
  pasosCompletados: [],
  creadoEn: '2026-10-18T10:00:00.000Z',
  dispositivoId: 'd',
  version: 1,
};
const conteo = {
  id: 'c1',
  practica: 'postraciones',
  cantidad: 100,
  origen: 'contador',
  fechaLocal: '2026-10-18',
  creadoEn: '2026-10-18T10:00:00.000Z',
  dispositivoId: 'd',
  version: 1,
};

function copia(tablas: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    app: 'mahamudrapp',
    versionEsquema: 1,
    exportadoEn: '2026-10-19T09:00:00.000Z',
    dispositivoId: 'd',
    tablas,
    ...extra,
  });
}

describe('leerCopia', () => {
  it('lee una copia válida', () => {
    const r = leerCopia(
      copia({ sesiones: [sesion], conteos: [conteo], ajustes: [], respaldos: [], borradores: [] }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.copia.sesiones).toHaveLength(1);
    expect(r.copia.conteos).toHaveLength(1);
    expect(r.copia.descartados).toBe(0);
  });

  it('rechaza lo que no es JSON, lo que no es de esta app y versiones más nuevas', () => {
    expect(leerCopia('esto no es json')).toMatchObject({ ok: false });
    expect(leerCopia(JSON.stringify({ app: 'otra', tablas: {} }))).toMatchObject({ ok: false });
    expect(leerCopia(copia({}, { versionEsquema: 99 }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/más nueva/),
    });
  });

  it('descarta registros inválidos y los cuenta, sin perder los válidos', () => {
    const r = leerCopia(
      copia({
        sesiones: [sesion, { ...sesion, id: '' }, { ...sesion, id: 's3', fechaLocal: '2026-02-30' }],
        conteos: [
          conteo,
          { ...conteo, id: 'c2', practica: 'inventada' },
          { ...conteo, id: 'c3', cantidad: 0 },
        ],
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.copia.sesiones.map((s) => s.id)).toEqual(['s1']);
    expect(r.copia.conteos.map((c) => c.id)).toEqual(['c1']);
    expect(r.copia.descartados).toBe(4);
  });

  it('nunca importa el id de dispositivo ni una sesión en curso', () => {
    const r = leerCopia(
      copia({
        ajustes: [
          { clave: 'nivel', valor: 2, actualizadoEn: '' },
          { clave: 'dispositivoId', valor: 'otro', actualizadoEn: '' },
          { clave: 'shineEnCurso', valor: {}, actualizadoEn: '' },
        ],
      }),
    );
    expect(r.ok && r.copia.ajustes.map((a) => a.clave)).toEqual(['nivel']);
  });
});

describe('borradorComoConteo', () => {
  it('convierte un conteo sin terminar en uno terminado, con id estable', () => {
    const b = {
      practica: 'chenresi' as const,
      fechaLocal: '2026-10-17',
      iniciadoEn: '2026-10-17T08:00:00.000Z',
      actualizadoEn: '2026-10-17T08:10:00.000Z',
      pasos: [100, 100, 1],
    };
    expect(borradorComoConteo(b, 'yo')).toMatchObject({
      id: 'borrador-chenresi-2026-10-17T08:00:00.000Z',
      cantidad: 201,
      fechaLocal: '2026-10-17',
      origen: 'importacion',
    });
    expect(borradorComoConteo({ ...b, pasos: [] }, 'yo')).toBeNull();
  });
});
