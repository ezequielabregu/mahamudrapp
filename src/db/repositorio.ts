// Única puerta de lectura y escritura a la base. Los registros de práctica (sesiones y
// conteos) solo se agregan: acá no hay ningún update ni delete sobre ellos.

import { borradorComoConteo, type CopiaLeida } from '../backup/importar';
import { infoDelDia } from '../domain/calendario';
import { esCantidadValida } from '../domain/conteos';
import { diaDeSemana, esFechaValida, fechaLocalDe } from '../domain/fechas';
import { estadoTemporizador, minutosValidos, SEGUNDOS_MINIMOS_PARA_GUARDAR } from '../domain/temporizador';
import { programa, type CompromisoId, type NumeroNivel, type Practica } from '../domain/programa';
import { nuevoId } from './ids';
import {
  BaseMahamudra,
  VERSION_ESQUEMA,
  type Ajuste,
  type Borrador,
  type Conteo,
  type OrigenConteo,
  type Respaldo,
  type Sesion,
  type TipoSesion,
} from './schema';

export type Apariencia = 'automatica' | 'clara' | 'oscura';
const APARIENCIAS_VALIDAS: Apariencia[] = ['automatica', 'clara', 'oscura'];

export type EscalaTexto = 'pequeno' | 'normal' | 'grande' | 'muy-grande';
const ESCALAS_VALIDAS: EscalaTexto[] = ['pequeno', 'normal', 'grande', 'muy-grande'];

export interface Preferencias {
  fechaInicio: string;
  nivel: NumeroNivel;
  compromiso: CompromisoId;
  escalaTexto: EscalaTexto;
  sonidoContador: boolean;
  apariencia: Apariencia;
  /** Duración elegida para el temporizador de Shiné. */
  minutosShine: number;
}

export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  fechaInicio: programa.fechaInicioPorDefecto,
  nivel: 1,
  compromiso: 'medio',
  escalaTexto: 'pequeno',
  sonidoContador: true,
  // Oscura por defecto: para meditar no se busca una pantalla luminosa.
  apariencia: 'oscura',
  minutosShine: programa.minutosMeditacionDiaria,
};

/** Sesión de Shiné con temporizador, mientras transcurre. Se guarda en ajustes (no es un registro de práctica). */
export interface ShineEnCurso {
  inicioMs: number;
  duracionSeg: number;
  /** Día al que pertenece: el del comienzo. */
  fechaLocal: string;
}

export interface ResumenImportacion {
  sesionesNuevas: number;
  sesionesRepetidas: number;
  conteosNuevos: number;
  conteosRepetidos: number;
  /** Ajustes de la copia que se toman porque en este teléfono todavía no se eligieron. */
  ajustesNuevos: number;
  descartados: number;
}

export interface NuevaSesion {
  tipo: TipoSesion;
  origen: Sesion['origen'];
  fechaLocal: string;
  duracionSeg: number;
  inicio?: string;
  fin?: string;
  nota?: string;
}

export interface NuevoConteo {
  practica: Practica;
  cantidad: number;
  fechaLocal: string;
  origen: OrigenConteo;
  corrigeId?: string;
  sesionId?: string;
}

export interface CopiaCompleta {
  app: 'mahamudrapp';
  versionEsquema: number;
  exportadoEn: string;
  dispositivoId: string;
  tablas: {
    sesiones: Sesion[];
    conteos: Conteo[];
    ajustes: Ajuste[];
    respaldos: Respaldo[];
    borradores: Borrador[];
  };
}

const CLAVE_DISPOSITIVO = 'dispositivoId';
const CLAVE_SHINE_EN_CURSO = 'shineEnCurso';
const DURACION_MAXIMA_SEG = 24 * 60 * 60;

export function crearRepositorio(db: BaseMahamudra, ahora: () => Date = () => new Date()) {
  const hoy = () => fechaLocalDe(ahora());

  async function dispositivoId(): Promise<string> {
    return db.transaction('rw', db.ajustes, async () => {
      const existente = await db.ajustes.get(CLAVE_DISPOSITIVO);
      if (typeof existente?.valor === 'string') return existente.valor;
      const id = nuevoId();
      await db.ajustes.put({ clave: CLAVE_DISPOSITIVO, valor: id, actualizadoEn: ahora().toISOString() });
      return id;
    });
  }

  async function leerPreferencias(): Promise<Preferencias> {
    const filas = await db.ajustes.toArray();
    const valores = Object.fromEntries(filas.map((f) => [f.clave, f.valor]));
    const prefs = { ...PREFERENCIAS_POR_DEFECTO, ...pick(valores, Object.keys(PREFERENCIAS_POR_DEFECTO)) };
    // 'chica' fue el nombre anterior de 'pequeno'; cualquier otro valor desconocido vuelve al de por defecto.
    if ((prefs.escalaTexto as string) === 'chica') prefs.escalaTexto = 'pequeno';
    if (!ESCALAS_VALIDAS.includes(prefs.escalaTexto))
      prefs.escalaTexto = PREFERENCIAS_POR_DEFECTO.escalaTexto;
    if (!APARIENCIAS_VALIDAS.includes(prefs.apariencia))
      prefs.apariencia = PREFERENCIAS_POR_DEFECTO.apariencia;
    if (!minutosValidos(prefs.minutosShine)) prefs.minutosShine = PREFERENCIAS_POR_DEFECTO.minutosShine;
    return prefs;
  }

  async function guardarPreferencia<K extends keyof Preferencias>(clave: K, valor: Preferencias[K]) {
    if (clave === 'fechaInicio' && !esFechaValida(valor as string)) {
      throw new Error('La fecha de inicio no es válida.');
    }
    await db.ajustes.put({ clave, valor, actualizadoEn: ahora().toISOString() });
  }

  function validarFecha(fechaLocal: string) {
    if (!esFechaValida(fechaLocal)) throw new Error('La fecha no es válida.');
    if (fechaLocal > hoy()) throw new Error('No se puede registrar práctica en una fecha futura.');
  }

  async function registrarSesion(datos: NuevaSesion): Promise<Sesion> {
    validarFecha(datos.fechaLocal);
    if (
      !Number.isInteger(datos.duracionSeg) ||
      datos.duracionSeg <= 0 ||
      datos.duracionSeg > DURACION_MAXIMA_SEG
    ) {
      throw new Error('La duración no es válida.');
    }
    const { fechaInicio } = await leerPreferencias();
    const info = infoDelDia(datos.fechaLocal, fechaInicio, programa);
    const sesion: Sesion = {
      id: nuevoId(),
      ...datos,
      trimestre: info?.trimestre,
      diaSemana: diaDeSemana(datos.fechaLocal),
      reflexion: info?.reflexionId,
      soporte: datos.tipo === 'shine' ? info?.soporteId : undefined,
      pasosCompletados: [],
      creadoEn: ahora().toISOString(),
      dispositivoId: await dispositivoId(),
      version: VERSION_ESQUEMA,
    };
    await db.sesiones.add(sesion);
    return sesion;
  }

  async function nuevoConteo(datos: NuevoConteo): Promise<Conteo> {
    validarFecha(datos.fechaLocal);
    if (!esCantidadValida(datos.cantidad)) throw new Error('La cantidad no es válida.');
    if (datos.cantidad < 0 && datos.origen !== 'correccion') {
      throw new Error('Una cantidad negativa solo puede ser una corrección.');
    }
    return {
      id: nuevoId(),
      ...datos,
      creadoEn: ahora().toISOString(),
      dispositivoId: await dispositivoId(),
      version: VERSION_ESQUEMA,
    };
  }

  async function registrarConteo(datos: NuevoConteo): Promise<Conteo> {
    const conteo = await nuevoConteo(datos);
    await db.conteos.add(conteo);
    return conteo;
  }

  /** Suma al conteo en curso. Si el borrador quedó de otro día, primero lo guarda en su día. */
  async function sumarAlBorrador(practica: Practica, cantidad: number): Promise<void> {
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw new Error('La cantidad no es válida.');
    const id = await dispositivoId();
    await db.transaction('rw', db.borradores, db.conteos, async () => {
      const momento = ahora().toISOString();
      let borrador = await db.borradores.get(practica);
      if (borrador && borrador.fechaLocal !== hoy()) {
        await consolidar(borrador, id);
        borrador = undefined;
      }
      const base: Borrador = borrador ?? {
        practica,
        fechaLocal: hoy(),
        iniciadoEn: momento,
        actualizadoEn: momento,
        pasos: [],
      };
      await db.borradores.put({ ...base, pasos: [...base.pasos, cantidad], actualizadoEn: momento });
    });
  }

  async function deshacerEnBorrador(practica: Practica): Promise<void> {
    await db.transaction('rw', db.borradores, async () => {
      const borrador = await db.borradores.get(practica);
      if (!borrador || borrador.pasos.length === 0) return;
      await db.borradores.put({
        ...borrador,
        pasos: borrador.pasos.slice(0, -1),
        actualizadoEn: ahora().toISOString(),
      });
    });
  }

  /** Convierte el conteo en curso en un registro definitivo. Devuelve el total guardado. */
  async function guardarBorrador(practica: Practica): Promise<number> {
    const id = await dispositivoId();
    return db.transaction('rw', db.borradores, db.conteos, async () => {
      const borrador = await db.borradores.get(practica);
      if (!borrador) return 0;
      return consolidar(borrador, id);
    });
  }

  async function consolidar(borrador: Borrador, id: string): Promise<number> {
    const total = totalBorrador(borrador);
    if (total > 0) {
      await db.conteos.add({
        id: nuevoId(),
        practica: borrador.practica,
        cantidad: total,
        origen: 'contador',
        fechaLocal: borrador.fechaLocal,
        creadoEn: ahora().toISOString(),
        dispositivoId: id,
        version: VERSION_ESQUEMA,
      });
    }
    await db.borradores.delete(borrador.practica);
    return total;
  }

  async function exportarTodo(): Promise<CopiaCompleta> {
    const id = await dispositivoId();
    return db.transaction(
      'r',
      [db.sesiones, db.conteos, db.ajustes, db.respaldos, db.borradores],
      async () => ({
        app: 'mahamudrapp' as const,
        versionEsquema: VERSION_ESQUEMA,
        exportadoEn: ahora().toISOString(),
        dispositivoId: id,
        tablas: {
          sesiones: await db.sesiones.toArray(),
          conteos: await db.conteos.toArray(),
          ajustes: await db.ajustes.toArray(),
          respaldos: await db.respaldos.toArray(),
          borradores: await db.borradores.toArray(),
        },
      }),
    );
  }

  /**
   * Única excepción al principio de solo agregar: borra todos los registros de práctica
   * (sesiones, conteos, conteos en curso y log de copias). Conserva los ajustes.
   * Exige una copia hecha hoy, para que los datos queden al menos en ese archivo.
   */
  async function borrarRegistros(): Promise<void> {
    await db.transaction('rw', [db.sesiones, db.conteos, db.borradores, db.respaldos], async () => {
      const ultima = await db.respaldos.orderBy('creadoEn').last();
      if (ultima?.fechaLocal !== hoy()) {
        throw new Error('Antes de borrar, hacé una copia de seguridad hoy.');
      }
      await Promise.all([
        db.sesiones.clear(),
        db.conteos.clear(),
        db.borradores.clear(),
        db.respaldos.clear(),
      ]);
    });
  }

  async function shineEnCurso(): Promise<ShineEnCurso | null> {
    const fila = await db.ajustes.get(CLAVE_SHINE_EN_CURSO);
    const v = fila?.valor as Partial<ShineEnCurso> | undefined;
    if (
      !v ||
      typeof v.inicioMs !== 'number' ||
      typeof v.duracionSeg !== 'number' ||
      !esFechaValida(v.fechaLocal ?? '')
    ) {
      return null;
    }
    return v as ShineEnCurso;
  }

  /** Empieza una sesión con temporizador. Si había otra sin cerrar, la reemplaza. */
  async function iniciarShine(minutos: number): Promise<ShineEnCurso> {
    if (!minutosValidos(minutos)) throw new Error('La duración no es válida.');
    const momento = ahora();
    const enCurso: ShineEnCurso = {
      inicioMs: momento.getTime(),
      duracionSeg: minutos * 60,
      fechaLocal: hoy(),
    };
    await db.ajustes.put({
      clave: CLAVE_SHINE_EN_CURSO,
      valor: enCurso,
      actualizadoEn: momento.toISOString(),
    });
    await guardarPreferencia('minutosShine', minutos);
    return enCurso;
  }

  /**
   * Cierra la sesión en curso. Si `guardar`, la registra con el tiempo transcurrido (como máximo,
   * el elegido). Es atómica e idempotente: si ya se cerró, devuelve null y no registra nada.
   */
  async function cerrarShine(
    guardar: boolean,
  ): Promise<{ sesion: Sesion | null; duracionSeg: number } | null> {
    return db.transaction('rw', db.ajustes, db.sesiones, async () => {
      const enCurso = await shineEnCurso();
      if (!enCurso) return null;
      const momento = ahora();
      const { transcurridoSeg } = estadoTemporizador(
        enCurso.inicioMs,
        enCurso.duracionSeg,
        momento.getTime(),
      );
      let sesion: Sesion | null = null;
      if (guardar && transcurridoSeg >= SEGUNDOS_MINIMOS_PARA_GUARDAR) {
        sesion = await registrarSesion({
          tipo: 'shine',
          origen: 'app',
          fechaLocal: enCurso.fechaLocal,
          duracionSeg: transcurridoSeg,
          inicio: new Date(enCurso.inicioMs).toISOString(),
          fin: new Date(enCurso.inicioMs + transcurridoSeg * 1000).toISOString(),
        });
      }
      await db.ajustes.delete(CLAVE_SHINE_EN_CURSO);
      return { sesion, duracionSeg: transcurridoSeg };
    });
  }

  /** Si la sesión en curso ya cumplió su tiempo (por ejemplo, con la app cerrada), la registra. */
  async function cerrarShineSiTermino(): Promise<boolean> {
    const enCurso = await shineEnCurso();
    if (!enCurso || !estadoTemporizador(enCurso.inicioMs, enCurso.duracionSeg, ahora().getTime()).terminado) {
      return false;
    }
    return (await cerrarShine(true)) !== null;
  }

  /** Lo que se agregaría con una copia: solo lo que no está (por id). No escribe nada. */
  async function planificarImportacion(copia: CopiaLeida) {
    const id = await dispositivoId();
    const conteosDeLaCopia = [
      ...copia.conteos,
      ...copia.borradores.flatMap((b) => borradorComoConteo(b, id) ?? []),
    ];
    const [sesionesLocales, conteosLocales, ajustesLocales, respaldosLocales] = await Promise.all([
      db.sesiones.bulkGet(copia.sesiones.map((s) => s.id)),
      db.conteos.bulkGet(conteosDeLaCopia.map((c) => c.id)),
      db.ajustes.bulkGet(copia.ajustes.map((a) => a.clave)),
      db.respaldos.bulkGet(copia.respaldos.map((r) => r.id)),
    ]);
    const sesiones = copia.sesiones.filter((_, i) => !sesionesLocales[i]);
    const conteos = conteosDeLaCopia.filter((_, i) => !conteosLocales[i]);
    const ajustes = copia.ajustes.filter((_, i) => !ajustesLocales[i]);
    const respaldos = copia.respaldos.filter((_, i) => !respaldosLocales[i]);
    const resumen: ResumenImportacion = {
      sesionesNuevas: sesiones.length,
      sesionesRepetidas: copia.sesiones.length - sesiones.length,
      conteosNuevos: conteos.length,
      conteosRepetidos: conteosDeLaCopia.length - conteos.length,
      ajustesNuevos: ajustes.length,
      descartados: copia.descartados,
    };
    return { resumen, sesiones, conteos, ajustes, respaldos };
  }

  /**
   * Fusiona una copia: agrega solo lo que no está (por id) y nunca sobrescribe. Los ajustes de la
   * copia se toman solo si en este teléfono no se eligieron. Importar dos veces no duplica nada.
   */
  async function importarCopia(copia: CopiaLeida): Promise<ResumenImportacion> {
    await dispositivoId();
    return db.transaction('rw', [db.sesiones, db.conteos, db.ajustes, db.respaldos], async () => {
      const plan = await planificarImportacion(copia);
      await db.sesiones.bulkAdd(plan.sesiones);
      await db.conteos.bulkAdd(plan.conteos);
      await db.ajustes.bulkAdd(plan.ajustes);
      await db.respaldos.bulkAdd(plan.respaldos);
      return plan.resumen;
    });
  }

  async function registrarRespaldo(metodo: Respaldo['metodo'], registros: number): Promise<void> {
    await db.respaldos.add({
      id: nuevoId(),
      creadoEn: ahora().toISOString(),
      fechaLocal: hoy(),
      metodo,
      registros,
    });
  }

  return {
    dispositivoId,
    leerPreferencias,
    guardarPreferencia,
    registrarSesion,
    registrarConteo,
    sumarAlBorrador,
    deshacerEnBorrador,
    guardarBorrador,
    exportarTodo,
    registrarRespaldo,
    borrarRegistros,
    planificarImportacion: async (copia: CopiaLeida) => (await planificarImportacion(copia)).resumen,
    importarCopia,
    shineEnCurso,
    iniciarShine,
    cerrarShine,
    cerrarShineSiTermino,

    sesionesEntre: (desde: string, hasta: string) =>
      db.sesiones.where('fechaLocal').between(desde, hasta, true, false).toArray(),
    todasLasSesiones: () => db.sesiones.toArray(),
    todosLosConteos: () => db.conteos.toArray(),
    conteosDePractica: (practica: Practica) => db.conteos.where('practica').equals(practica).toArray(),
    conteosEntre: (desde: string, hasta: string) =>
      db.conteos.where('fechaLocal').between(desde, hasta, true, false).toArray(),
    borrador: (practica: Practica) => db.borradores.get(practica),
    borradores: () => db.borradores.toArray(),
    ultimoRespaldo: () => db.respaldos.orderBy('creadoEn').last(),
    cantidadDeRegistros: async () => ({
      sesiones: await db.sesiones.count(),
      conteos: await db.conteos.count(),
    }),
  };
}

export function totalBorrador(borrador: Pick<Borrador, 'pasos'> | undefined): number {
  return borrador ? borrador.pasos.reduce((a, b) => a + b, 0) : 0;
}

function pick(origen: Record<string, unknown>, claves: string[]): Record<string, unknown> {
  return Object.fromEntries(claves.filter((c) => c in origen).map((c) => [c, origen[c]]));
}

export type Repositorio = ReturnType<typeof crearRepositorio>;

export const repositorio = crearRepositorio(new BaseMahamudra());
