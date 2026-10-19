import { useState } from 'react';
import { clasesBoton } from '../components/estilos';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { useInstalacion } from '../hooks/useInstalacion';

export function Instalar() {
  const { sistema, instalada, puedeInstalarDirecto, instalar } = useInstalacion();
  const [rechazada, setRechazada] = useState(false);

  if (instalada) {
    return (
      <Pantalla titulo="Instalar" volver={{ a: '/ajustes', texto: 'Ajustes' }}>
        <p>La app ya está instalada en este teléfono. Abrila siempre desde su ícono.</p>
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Instalar" volver={{ a: '/ajustes', texto: 'Ajustes' }}>
      <p>
        Instalada, la app funciona sin internet y el teléfono cuida mejor tus registros. Instalala antes de
        empezar a registrar: lo que anotes en el navegador no pasa a la app instalada.
      </p>

      {sistema === 'ios' && (
        <Seccion titulo="En iPhone o iPad">
          <ol className="list-decimal space-y-3 pl-6">
            <li>Abrí esta página en Safari. Otros navegadores no permiten instalarla.</li>
            <li>
              Tocá el botón <strong>Compartir</strong>: el cuadrado con una flecha hacia arriba, abajo o
              arriba de la pantalla.
            </li>
            <li>
              Bajá en la lista y tocá <strong>Agregar a inicio</strong>.
            </li>
            <li>
              Tocá <strong>Agregar</strong>. Desde ahora, abrí la app con su ícono.
            </li>
          </ol>
        </Seccion>
      )}

      {sistema !== 'ios' && puedeInstalarDirecto && (
        <button
          type="button"
          className={clasesBoton('principal')}
          onClick={async () => setRechazada(!(await instalar()))}
        >
          Instalar app
        </button>
      )}
      {rechazada && <p role="status">No se instaló. Podés intentarlo de nuevo cuando quieras.</p>}

      {sistema !== 'ios' && !puedeInstalarDirecto && (
        <Seccion titulo={sistema === 'android' ? 'En Android' : 'En la computadora'}>
          <ol className="list-decimal space-y-3 pl-6">
            <li>Abrí esta página en Chrome.</li>
            <li>
              Tocá el menú de los tres puntos <strong>⋮</strong>, arriba a la derecha.
            </li>
            <li>
              Tocá <strong>Instalar app</strong> o <strong>Agregar a la pantalla principal</strong>.
            </li>
          </ol>
        </Seccion>
      )}
    </Pantalla>
  );
}
