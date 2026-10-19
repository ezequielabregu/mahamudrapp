import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { hacerCopia, puedeCompartirArchivos, type MetodoCopia } from '../backup/exportar';
import { clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { repositorio } from '../db/repositorio';
import { formatearFechaCorta, formatearNumero, haceCuanto } from '../domain/formato';
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
    <Pantalla titulo="Copia de seguridad">
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
            Registros guardados: {formatearNumero(registros.sesiones)} sesiones y{' '}
            {formatearNumero(registros.conteos)} conteos.
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
    </Pantalla>
  );
}
