import { useState, type ReactNode } from 'react';
import { claseTarjeta, clasesBoton } from '../components/estilos';
import {
  COLOR_ENLACE_IOS,
  FilaMenu,
  IconoAgregarInicio,
  IconoCompartir,
  IconoDeLaApp,
  IconoTresPuntos,
  Interruptor,
  Maqueta,
  Tocar,
} from '../components/IlustracionesIOS';
import { Pantalla } from '../components/Pantalla';
import { Seccion } from '../components/Seccion';
import { useInstalacion } from '../hooks/useInstalacion';
import { analizarNavegadorIOS, enlaceParaSafari } from '../pwa/navegadorIOS';

/** La dirección de la app, sin la parte de la pantalla actual: abre en Hoy. */
const DIRECCION_APP = `${window.location.origin}${import.meta.env.BASE_URL}`;

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

      {sistema === 'ios' && <GuiaIOS />}

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

function GuiaIOS() {
  const navegador = analizarNavegadorIOS(navigator.userAgent);
  // «Abrir como app web» existe desde iOS 26; si no se sabe la versión, se muestra igual.
  const conAppWeb = navegador.versionSafari === null || navegador.versionSafari >= 26;
  let numero = 0;
  const siguiente = () => ++numero;
  return (
    <>
      {!navegador.esSafari && <AbrirEnSafari nombre={navegador.nombre} />}
      <h2 className="text-xl font-semibold">
        {navegador.esSafari ? 'Cómo instalarla, paso a paso' : 'Después, ya en Safari'}
      </h2>
      <ol className="space-y-4">
        <PasoIlustrado numero={siguiente()} titulo="Tocá el botón Compartir">
          <Maqueta>
            <Tocar>
              <IconoCompartir />
            </Tocar>
          </Maqueta>
          <p className="text-tenue">
            Es un cuadrado con una flecha hacia arriba: abajo en el iPhone, arriba en el iPad. Si no lo ves,
            tocá primero <IconoTresPuntos chico /> (tres puntos) y elegí{' '}
            <strong className="text-tinta">Compartir</strong>.
          </p>
        </PasoIlustrado>

        <PasoIlustrado numero={siguiente()} titulo="Elegí «Agregar a inicio»">
          <Maqueta>
            <Tocar>
              <FilaMenu texto="Agregar a inicio" icono={<IconoAgregarInicio />} />
            </Tocar>
          </Maqueta>
          <p className="text-tenue">
            Si no aparece, bajá en la lista. En algunos teléfonos dice «Añadir a pantalla de inicio».
          </p>
        </PasoIlustrado>

        {conAppWeb && (
          <PasoIlustrado numero={siguiente()} titulo="Dejá activada «Abrir como app web»">
            <Maqueta>
              <FilaMenu texto="Abrir como app web" icono={<Interruptor />} />
            </Maqueta>
            <p className="text-tenue">
              Aparece en los iPhone y iPad más nuevos. Si no la ves, seguí al paso siguiente.
            </p>
          </PasoIlustrado>
        )}

        <PasoIlustrado numero={siguiente()} titulo="Tocá «Agregar», arriba a la derecha">
          <Maqueta>
            <span className="flex w-full max-w-[16rem] items-center justify-between">
              <span style={{ color: COLOR_ENLACE_IOS }}>Cancelar</span>
              <Tocar>
                <span className="px-1 font-semibold" style={{ color: COLOR_ENLACE_IOS }}>
                  Agregar
                </span>
              </Tocar>
            </span>
          </Maqueta>
        </PasoIlustrado>

        <PasoIlustrado numero={siguiente()} titulo="Listo: abrila desde su ícono">
          <Maqueta>
            <IconoDeLaApp />
          </Maqueta>
          <p className="text-tenue">
            Aparece en la pantalla de inicio, como cualquier app. Usala siempre desde ahí, no desde Safari.
          </p>
        </PasoIlustrado>
      </ol>
    </>
  );
}

function PasoIlustrado(props: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <li className={`${claseTarjeta} space-y-3 p-5`}>
      <p className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-[2.2rem] shrink-0 items-center justify-center rounded-full border-2 border-oro font-serif font-semibold text-oro"
        >
          {props.numero}
        </span>
        <span className="text-lg font-semibold">
          <span className="sr-only">Paso {props.numero}: </span>
          {props.titulo}
        </span>
      </p>
      {props.children}
    </li>
  );
}

/** Fuera de Safari no se puede instalar: ofrece abrir la página en Safari o copiar el enlace. */
function AbrirEnSafari({ nombre }: { nombre: string | null }) {
  const [copiado, setCopiado] = useState<'si' | 'no' | null>(null);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(DIRECCION_APP);
      setCopiado('si');
    } catch {
      setCopiado('no');
    }
  }

  return (
    <section className="space-y-3 rounded-3xl border-2 border-oro bg-aviso p-5">
      <h2 className="text-xl font-semibold">Primero, abrila en Safari</h2>
      <p>
        {nombre ? `Estás usando ${nombre}.` : 'Estás usando otro navegador.'} En iPhone y iPad, la app se
        instala desde Safari.
      </p>
      <a href={enlaceParaSafari(DIRECCION_APP)} className={clasesBoton('principal')}>
        Abrir en Safari
      </a>
      <button type="button" className={clasesBoton()} onClick={copiar}>
        Copiar el enlace
      </button>
      {copiado === 'si' && (
        <p role="status">
          Enlace copiado. Abrí <strong>Safari</strong>, tocá la barra de la dirección, pegalo y entrá.
        </p>
      )}
      {copiado === 'no' && (
        <p role="status">
          No se pudo copiar. Escribí esta dirección en Safari:{' '}
          <span className="font-semibold break-all select-all">{DIRECCION_APP}</span>
        </p>
      )}
      <p className="text-tenue">Si «Abrir en Safari» no hace nada, usá «Copiar el enlace».</p>
    </section>
  );
}
