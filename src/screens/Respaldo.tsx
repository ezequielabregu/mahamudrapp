import { useLiveQuery } from 'dexie-react-hooks';
import { useId, useState, type ChangeEvent } from 'react';
import { hacerCopia, puedeCompartirArchivos, type MetodoCopia } from '../backup/exportar';
import { leerCopia, type CopiaLeida } from '../backup/importar';
import { clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { repositorio, type ResumenImportacion } from '../db/repositorio';
import { fechaLocalDe } from '../domain/fechas';
import { contar, formatearFechaCorta, haceCuanto } from '../domain/formato';
import { useHoy } from '../hooks/useHoy';

export function Respaldo() {
  const hoy = useHoy();
  const ultima = useLiveQuery(() => repositorio.ultimoRespaldo(), []);
  const registros = useLiveQuery(() => repositorio.cantidadDeRegistros(), []);
  const [estado, setEstado] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const compartir = puedeCompartirArchivos();

  async function copiar(metodo: MetodoCopia) {
    setOcupado(true);
    setEstado(null);
    try {
      const resultado = await hacerCopia(repositorio, metodo);
      if (resultado === 'compartir') setEstado('Copia enviada.');
      if (resultado === 'descarga') setEstado('Copia descargada. Guardala fuera del teléfono.');
    } catch {
      setEstado('No se pudo hacer la copia. Probá con la otra opción.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Pantalla titulo="Copia" volver={{ a: '/ajustes', texto: 'Ajustes' }}>
      <p>
        Tus registros viven solo en este teléfono. Hacé una copia seguido y guardala en otro lugar: mandátela
        por WhatsApp o por mail, o guardala en Drive o en iCloud.
      </p>

      <Seccion titulo="Estado">
        <p>
          {ultima
            ? `Última copia: ${haceCuanto(ultima.fechaLocal, hoy)} (${formatearFechaCorta(ultima.fechaLocal)}).`
            : 'Todavía no hiciste ninguna copia.'}
        </p>
        {registros && (
          <p className="text-tenue">
            Registros guardados: {contar(registros.sesiones, 'sesión', 'sesiones')} y{' '}
            {contar(registros.conteos, 'conteo', 'conteos')}.
          </p>
        )}
      </Seccion>

      {compartir && (
        <button
          type="button"
          className={clasesBoton('principal')}
          disabled={ocupado}
          onClick={() => copiar('compartir')}
        >
          Enviar una copia
        </button>
      )}
      <button
        type="button"
        className={clasesBoton(compartir ? 'secundario' : 'principal')}
        disabled={ocupado}
        onClick={() => copiar('descarga')}
      >
        Descargar el archivo
      </button>
      {estado && <p role="status">{estado}</p>}

      <Restaurar />
    </Pantalla>
  );
}

type Paso =
  | { etapa: 'elegir' }
  | { etapa: 'confirmar'; copia: CopiaLeida; resumen: ResumenImportacion }
  | { etapa: 'hecho'; resumen: ResumenImportacion };

/** Restaurar una copia: elegir el archivo, ver el resumen y confirmar. Nunca duplica ni pisa nada. */
function Restaurar() {
  const idArchivo = useId();
  const [paso, setPaso] = useState<Paso>({ etapa: 'elegir' });
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function elegir(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setError(null);
    const lectura = leerCopia(await archivo.text());
    if (!lectura.ok) {
      setError(lectura.error);
      return;
    }
    setPaso({
      etapa: 'confirmar',
      copia: lectura.copia,
      resumen: await repositorio.planificarImportacion(lectura.copia),
    });
  }

  async function importar(copia: CopiaLeida) {
    setOcupado(true);
    try {
      setPaso({ etapa: 'hecho', resumen: await repositorio.importarCopia(copia) });
    } catch {
      setError('No se pudo restaurar la copia. No se cambió nada.');
      setPaso({ etapa: 'elegir' });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Seccion titulo="Restaurar una copia">
      {paso.etapa === 'elegir' && (
        <>
          <p className="text-tenue">
            Para pasar tus registros a este teléfono. Se agrega solo lo que falta: no se duplica ni se borra
            nada.
          </p>
          <label htmlFor={idArchivo} className={`${clasesBoton()} cursor-pointer`}>
            Elegir el archivo de la copia
          </label>
          <input
            id={idArchivo}
            type="file"
            accept=".json,application/json"
            onChange={elegir}
            className="sr-only"
          />
        </>
      )}

      {paso.etapa === 'confirmar' && (
        <>
          <p>
            Copia
            {paso.copia.exportadoEn &&
              ` del ${formatearFechaCorta(fechaLocalDe(new Date(paso.copia.exportadoEn)))}`}
            .
          </p>
          <ResumenCopia resumen={paso.resumen} futuro />
          {paso.resumen.sesionesNuevas + paso.resumen.conteosNuevos + paso.resumen.ajustesNuevos > 0 ? (
            <button
              type="button"
              className={clasesBoton('principal')}
              disabled={ocupado}
              onClick={() => importar(paso.copia)}
            >
              Restaurar
            </button>
          ) : (
            <p className="font-semibold">Todo lo de esta copia ya está en este teléfono.</p>
          )}
          <button type="button" className={clasesBoton()} onClick={() => setPaso({ etapa: 'elegir' })}>
            Cancelar
          </button>
        </>
      )}

      {paso.etapa === 'hecho' && (
        <>
          <p role="status" className="font-semibold">
            Copia restaurada.
          </p>
          <ResumenCopia resumen={paso.resumen} />
        </>
      )}

      {error && (
        <p role="alert" className="font-semibold">
          {error}
        </p>
      )}
    </Seccion>
  );
}

function ResumenCopia({ resumen, futuro = false }: { resumen: ResumenImportacion; futuro?: boolean }) {
  const verbo = futuro ? 'Se van a agregar' : 'Se agregaron';
  return (
    <ul className="list-disc space-y-1 pl-6">
      <li>
        {verbo} {contar(resumen.sesionesNuevas, 'sesión', 'sesiones')} y{' '}
        {contar(resumen.conteosNuevos, 'conteo', 'conteos')}.
      </li>
      {resumen.sesionesRepetidas + resumen.conteosRepetidos > 0 && (
        <li className="text-tenue">
          {contar(
            resumen.sesionesRepetidas + resumen.conteosRepetidos,
            'registro ya estaba',
            'registros ya estaban',
          )}{' '}
          en este teléfono.
        </li>
      )}
      {resumen.ajustesNuevos > 0 && (
        <li className="text-tenue">
          {futuro ? 'Además se toman de la copia' : 'Además se tomaron de la copia'} los ajustes que acá
          todavía no estaban elegidos (nivel, compromiso, apariencia…).
        </li>
      )}
      {resumen.descartados > 0 && (
        <li className="text-tenue">
          {contar(resumen.descartados, 'registro dañado no se importa', 'registros dañados no se importan')}.
        </li>
      )}
    </ul>
  );
}
