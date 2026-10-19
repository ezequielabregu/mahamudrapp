import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { crearRepositorio } from './repositorio';
import { BaseMahamudra } from './schema';

// Cada test usa su propia base en memoria (fake-indexeddb): nunca toca la base real.
const abiertas: BaseMahamudra[] = [];
let reloj = new Date(2026, 9, 18, 9, 0);

function nuevoRepo() {
  const db = new BaseMahamudra(`test-${crypto.randomUUID()}`);
  abiertas.push(db);
  return { db, repo: crearRepositorio(db, () => reloj) };
}

afterEach(async () => {
  reloj = new Date(2026, 9, 18, 9, 0);
  await Promise.all(abiertas.splice(0).map((db) => db.delete()));
});

describe('repositorio', () => {
  it('usa las preferencias por defecto y guarda cambios', async () => {
    const { repo } = nuevoRepo();
    expect((await repo.leerPreferencias()).fechaInicio).toBe('2026-10-14');
    await repo.guardarPreferencia('compromiso', 'medio');
    expect((await repo.leerPreferencias()).compromiso).toBe('medio');
    await expect(repo.guardarPreferencia('fechaInicio', '2026-02-30')).rejects.toThrow();
  });

  it('genera un único id de dispositivo', async () => {
    const { repo } = nuevoRepo();
    const [a, b] = await Promise.all([repo.dispositivoId(), repo.dispositivoId()]);
    expect(a).toBe(b);
  });

  it('registra una sesión con el contexto del programa de esa fecha', async () => {
    const { repo } = nuevoRepo();
    const sesion = await repo.registrarSesion({
      tipo: 'shine',
      origen: 'manual',
      fechaLocal: '2026-10-16',
      duracionSeg: 1800,
    });
    expect(sesion).toMatchObject({
      trimestre: 1,
      diaSemana: 5,
      reflexion: 'karma',
      soporte: 'buda-enfrente',
    });
    expect(await repo.sesionesEntre('2026-10-14', '2026-10-19')).toHaveLength(1);
  });

  it('rechaza fechas futuras y duraciones inválidas', async () => {
    const { repo } = nuevoRepo();
    await expect(
      repo.registrarSesion({ tipo: 'shine', origen: 'manual', fechaLocal: '2026-10-19', duracionSeg: 1800 }),
    ).rejects.toThrow(/futura/);
    await expect(
      repo.registrarSesion({ tipo: 'shine', origen: 'app', fechaLocal: '2026-10-18', duracionSeg: 0 }),
    ).rejects.toThrow();
  });

  it('solo acepta cantidades negativas como corrección', async () => {
    const { repo } = nuevoRepo();
    await expect(
      repo.registrarConteo({
        practica: 'postraciones',
        cantidad: -5,
        fechaLocal: '2026-10-18',
        origen: 'manual',
      }),
    ).rejects.toThrow();
    const c = await repo.registrarConteo({
      practica: 'postraciones',
      cantidad: -5,
      fechaLocal: '2026-10-18',
      origen: 'correccion',
    });
    expect(c.cantidad).toBe(-5);
  });

  it('el contador escribe un borrador, deshace y consolida en un solo conteo', async () => {
    const { db, repo } = nuevoRepo();
    await repo.sumarAlBorrador('postraciones', 1);
    await repo.sumarAlBorrador('postraciones', 1);
    await repo.sumarAlBorrador('postraciones', 21);
    await repo.deshacerEnBorrador('postraciones');
    expect((await repo.borrador('postraciones'))?.pasos).toEqual([1, 1]);

    expect(await repo.guardarBorrador('postraciones')).toBe(2);
    expect(await repo.borrador('postraciones')).toBeUndefined();
    const conteos = await db.conteos.toArray();
    expect(conteos).toHaveLength(1);
    expect(conteos[0]).toMatchObject({ practica: 'postraciones', cantidad: 2, origen: 'contador' });
  });

  it('un borrador vacío no genera conteos', async () => {
    const { db, repo } = nuevoRepo();
    await repo.sumarAlBorrador('chenresi', 100);
    await repo.deshacerEnBorrador('chenresi');
    expect(await repo.guardarBorrador('chenresi')).toBe(0);
    expect(await db.conteos.count()).toBe(0);
  });

  it('si el borrador quedó de ayer, lo guarda en su día antes de seguir', async () => {
    const { db, repo } = nuevoRepo();
    await repo.sumarAlBorrador('postraciones', 10);
    reloj = new Date(2026, 9, 19, 7, 0);
    await repo.sumarAlBorrador('postraciones', 1);

    const conteos = await db.conteos.toArray();
    expect(conteos).toEqual([expect.objectContaining({ cantidad: 10, fechaLocal: '2026-10-18' })]);
    expect(await repo.borrador('postraciones')).toMatchObject({ fechaLocal: '2026-10-19', pasos: [1] });
  });

  it('la copia completa incluye todas las tablas y la versión del esquema', async () => {
    const { repo } = nuevoRepo();
    await repo.registrarSesion({ tipo: 'shine', origen: 'app', fechaLocal: '2026-10-18', duracionSeg: 1800 });
    await repo.registrarConteo({
      practica: 'chenresi',
      cantidad: 300,
      fechaLocal: '2026-10-18',
      origen: 'manual',
    });
    await repo.sumarAlBorrador('postraciones', 5);

    const copia = await repo.exportarTodo();
    expect(copia.app).toBe('mahamudrapp');
    expect(copia.versionEsquema).toBe(1);
    expect(copia.tablas.sesiones).toHaveLength(1);
    expect(copia.tablas.conteos).toHaveLength(1);
    expect(copia.tablas.borradores).toHaveLength(1);
    expect(copia.tablas.ajustes.some((a) => a.clave === 'dispositivoId')).toBe(true);
  });

  it('borrar los registros exige una copia de hoy y conserva los ajustes', async () => {
    const { db, repo } = nuevoRepo();
    await repo.guardarPreferencia('nivel', 2);
    await repo.registrarSesion({ tipo: 'shine', origen: 'app', fechaLocal: '2026-10-18', duracionSeg: 1800 });
    await repo.registrarConteo({
      practica: 'chenresi',
      cantidad: 100,
      fechaLocal: '2026-10-18',
      origen: 'manual',
    });
    await repo.sumarAlBorrador('postraciones', 3);

    await expect(repo.borrarRegistros()).rejects.toThrow(/copia/);
    expect(await db.sesiones.count()).toBe(1);

    await repo.registrarRespaldo('descarga', 2);
    await repo.borrarRegistros();
    expect(await db.sesiones.count()).toBe(0);
    expect(await db.conteos.count()).toBe(0);
    expect(await db.borradores.count()).toBe(0);
    expect((await repo.leerPreferencias()).nivel).toBe(2);
  });

  it('una copia de ayer no alcanza para borrar', async () => {
    const { repo } = nuevoRepo();
    await repo.registrarRespaldo('descarga', 0);
    reloj = new Date(2026, 9, 19, 9, 0);
    await expect(repo.borrarRegistros()).rejects.toThrow(/copia/);
  });

  it('el tamaño de texto por defecto es Pequeño y el valor viejo "chica" se convierte', async () => {
    const { db, repo } = nuevoRepo();
    expect((await repo.leerPreferencias()).escalaTexto).toBe('pequeno');
    await db.ajustes.put({ clave: 'escalaTexto', valor: 'chica', actualizadoEn: '' });
    expect((await repo.leerPreferencias()).escalaTexto).toBe('pequeno');
    await db.ajustes.put({ clave: 'escalaTexto', valor: 'gigante', actualizadoEn: '' });
    expect((await repo.leerPreferencias()).escalaTexto).toBe('pequeno');
  });
});
