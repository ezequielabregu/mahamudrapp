import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router';
import type { ContextoLayout } from '../App';
import { Aviso } from '../components/Aviso';
import { AvisoActualizacion } from '../components/AvisoActualizacion';
import { BarraProgreso } from '../components/BarraProgreso';
import { clasesBoton } from '../components/estilos';
import { Insignia } from '../components/Insignia';
import { GrupoSeccion } from '../components/GrupoSeccion';
import { ListaPasos } from '../components/ListaPasos';
import { MandalaAnio } from '../components/MandalaAnio';
import { Pantalla } from '../components/Pantalla';
import { Tarjeta } from '../components/Tarjeta';
import { repositorio, totalBorrador } from '../db/repositorio';
import type { InfoDelDia } from '../domain/calendario';
import {
  formatearDiaYMes,
  formatearFechaCorta,
  formatearMinutos,
  formatearNumero,
  haceCuanto,
  nombreDelDia,
} from '../domain/formato';
import { programa, type Practica } from '../domain/programa';
import type { ResumenDelDia } from '../domain/resumen';
import { guiaPreliminar, guiaShine, pasosDelDia } from '../domain/sesiones';
import { useDia } from '../hooks/useDia';
import { useHoy } from '../hooks/useHoy';
import { useInstalacion } from '../hooks/useInstalacion';
import { usePreferencias } from '../hooks/usePreferencias';

export function Hoy() {
  const hoy = useHoy();
  const prefs = usePreferencias();
  const dia = useDia(hoy, prefs);
  const borradores = useLiveQuery(() => repositorio.borradores(), []);
  const shineEnCurso = useLiveQuery(() => repositorio.shineEnCurso(), []);

  // Si una sesión con temporizador cumplió su tiempo fuera de su pantalla, se registra al volver.
  useEffect(() => {
    const cerrar = () => void repositorio.cerrarShineSiTermino();
    cerrar();
    document.addEventListener('visibilitychange', cerrar);
    return () => document.removeEventListener('visibilitychange', cerrar);
  }, []);
  const instalacion = useInstalacion();
  const { actualizacionLista, actualizar } = useOutletContext<ContextoLayout>();
  const mensaje = (useLocation().state as { mensaje?: string } | null)?.mensaje;

  if (!prefs || !dia) return null;
  const { info, resumen } = dia;
  const pendientes = (borradores ?? []).filter((b) => totalBorrador(b) > 0);
  const sugerirInstalar = !instalacion.instalada && instalacion.sistema !== 'otro';

  return (
    <Pantalla
      antetitulo={formatearDiaYMes(hoy)}
      titulo={nombreDelDia(hoy)}
      adorno={
        info && (
          <MandalaAnio
            trimestre={info.trimestre}
            diaDelTrimestre={info.diaDelTrimestre}
            diasDelTrimestre={info.diasDelTrimestre}
          />
        )
      }
    >
      {actualizacionLista && <AvisoActualizacion alActualizar={actualizar} />}

      {mensaje && (
        <p role="status" className="font-semibold text-hecho">
          {mensaje}
        </p>
      )}

      {sugerirInstalar && (
        <Aviso>
          <p>Para no perder tus registros, instalá la app en tu teléfono antes de empezar a usarla.</p>
          <Link to="/instalar" className={clasesBoton()}>
            Cómo instalarla
          </Link>
        </Aviso>
      )}

      {shineEnCurso && (
        <Aviso>
          <p>Tenés una sesión de Shiné en curso.</p>
          <Link to="/sesion/shine" className={clasesBoton('principal')}>
            Volver a la sesión
          </Link>
        </Aviso>
      )}

      {pendientes.map((b) => (
        <Aviso key={b.practica}>
          <p>
            Tenés un conteo sin terminar: {formatearNumero(totalBorrador(b))}{' '}
            {programa.practicas[b.practica].unidad}.
          </p>
          <Link to={`/contador/${b.practica}`} className={clasesBoton()}>
            Seguir contando
          </Link>
        </Aviso>
      ))}

      {!info || !resumen ? (
        <Tarjeta titulo="Todavía no empezó el año de práctica">
          <p>Empieza el {formatearFechaCorta(prefs.fechaInicio)}. Podés cambiar la fecha en Ajustes.</p>
        </Tarjeta>
      ) : (
        <>
          <GrupoSeccion titulo={`Sesión 1 · ${guiaShine.momento}`}>
            <TarjetaShine info={info} resumen={resumen} />
          </GrupoSeccion>
          {resumen.preliminar && (
            <GrupoSeccion
              titulo={`Sesión 2 · ${guiaPreliminar(resumen.preliminar.practica)?.momento ?? 'Preliminar del trimestre'}`}
            >
              <TarjetaPreliminar info={info} preliminar={resumen.preliminar} />
            </GrupoSeccion>
          )}
          <GrupoSeccion titulo="Durante el día">
            {resumen.yidam && <TarjetaYidam yidam={resumen.yidam} />}
            <TarjetaChenresi resumen={resumen} />
          </GrupoSeccion>
        </>
      )}

      {/* Fila fina con borde, sin relleno ni sombra: se distingue sin competir con las sesiones. */}
      <Link
        to="/programa"
        className="mt-8 flex min-h-[3.5rem] items-center gap-3 rounded-2xl border border-borde px-4 py-2 font-semibold active:bg-resalte"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[1.4em] shrink-0 text-oro"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x={3.5} y={5} width={17} height={15.5} rx={2.5} />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className="min-w-0 flex-1">
          {info ? `Programa del ${info.trimestre}º trimestre` : 'Programa del año'}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[1.1em] shrink-0 text-oro"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>

      {dia.recordarCopia ? (
        <Aviso>
          <p>
            {dia.ultimaCopia
              ? `Tu última copia de seguridad es de ${haceCuanto(dia.ultimaCopia, hoy)}.`
              : 'Todavía no hiciste ninguna copia de seguridad.'}{' '}
            Tus registros están solo en este teléfono.
          </p>
          <Link to="/respaldo" className={clasesBoton()}>
            Hacer una copia
          </Link>
        </Aviso>
      ) : (
        dia.ultimaCopia && (
          <p className="text-center text-tenue">
            Última copia de seguridad: {haceCuanto(dia.ultimaCopia, hoy)}.
          </p>
        )
      )}
    </Pantalla>
  );
}

function TarjetaShine({ info, resumen }: { info: InfoDelDia; resumen: ResumenDelDia }) {
  const hecha = resumen.shine.sesiones > 0;
  return (
    <Tarjeta
      nivel={3}
      titulo={guiaShine.titulo}
      subtitulo={guiaShine.duracion}
      estado={
        <Insignia
          hecho={hecha}
          texto={hecha ? `Hecha · ${formatearMinutos(resumen.shine.segundos)}` : 'Pendiente'}
        />
      }
    >
      <Pasos plegados={hecha}>
        <ListaPasos pasos={pasosDelDia(guiaShine, info)} info={info} />
      </Pasos>
      <Link to="/sesion/shine" className={clasesBoton(hecha ? 'secundario' : 'principal')}>
        {hecha ? 'Otra sesión con temporizador' : 'Comenzar la sesión'}
      </Link>
      <Link to="/registrar?que=sesion" className={clasesBoton()}>
        Registrar sin temporizador
      </Link>
    </Tarjeta>
  );
}

type ResumenPreliminar = NonNullable<ResumenDelDia['preliminar']>;

function TarjetaPreliminar({ info, preliminar }: { info: InfoDelDia; preliminar: ResumenPreliminar }) {
  const { practica, hoy, trimestre, metaTrimestre, metaDiaria } = preliminar;
  const datos = programa.practicas[practica];
  const guia = guiaPreliminar(practica);
  const hecha = hoy > 0;

  return (
    <Tarjeta
      nivel={3}
      titulo={datos.titulo}
      estado={<Insignia hecho={hecha} texto={`Hoy: ${formatearNumero(hoy)}`} />}
    >
      {metaDiaria && <Avance etiqueta="Hoy, de lo sugerido" valor={hoy} meta={metaDiaria} />}
      <Avance etiqueta="En el trimestre" valor={trimestre} meta={metaTrimestre} />
      {guia ? (
        <Pasos plegados={hecha}>
          <ListaPasos pasos={pasosDelDia(guia, info)} info={info} />
        </Pasos>
      ) : (
        <p className="text-tenue">Los pasos de esta sesión se van a cargar más adelante.</p>
      )}
      <Link to={`/contador/${practica}`} className={clasesBoton('principal')}>
        Contar {datos.unidad}
      </Link>
      <RegistrarSinContador practica={practica} />
    </Tarjeta>
  );
}

function TarjetaChenresi({ resumen }: { resumen: ResumenDelDia }) {
  const datos = programa.practicas.chenresi;
  const { hoy, anio, metaAnio } = resumen.chenresi;
  return (
    <Tarjeta
      nivel={3}
      titulo="Chenresi"
      estado={<Insignia hecho={hoy > 0} texto={`Hoy: ${formatearNumero(hoy)}`} />}
    >
      {datos.mantra && (
        <p lang="bo-Latn" className="font-serif text-xl tracking-wide text-oro italic">
          {datos.mantra}
        </p>
      )}
      <Avance etiqueta="En el año" valor={anio} meta={metaAnio ?? 0} />
      {metaAnio === null && <p className="text-tenue">Optativo en tu nivel.</p>}
      <Link to="/contador/chenresi" className={clasesBoton('principal')}>
        Contar mantras
      </Link>
      <RegistrarSinContador practica="chenresi" />
    </Tarjeta>
  );
}

function TarjetaYidam({ yidam }: { yidam: NonNullable<ResumenDelDia['yidam']> }) {
  const datos = programa.practicas[yidam.practica];
  return (
    <Tarjeta
      nivel={3}
      titulo="Yidam"
      subtitulo={datos.titulo}
      estado={<Insignia hecho={yidam.hoy > 0} texto={`Hoy: ${formatearNumero(yidam.hoy)}`} />}
    >
      <Avance etiqueta="Acumulado" valor={yidam.total} meta={yidam.meta} />
      <Link to={`/contador/${yidam.practica}`} className={clasesBoton('principal')}>
        Contar mantras
      </Link>
      <RegistrarSinContador practica={yidam.practica} />
    </Tarjeta>
  );
}

function Avance(props: { etiqueta: string; valor: number; meta: number; children?: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-tenue">{props.etiqueta}</span>
        <span className="tabular-nums">
          <span className="text-lg font-semibold">{formatearNumero(props.valor)}</span>
          {props.meta > 0 && <span className="text-tenue"> de {formatearNumero(props.meta)}</span>}
        </span>
      </p>
      {props.meta > 0 && <BarraProgreso valor={props.valor} maximo={props.meta} etiqueta={props.etiqueta} />}
      {props.children}
    </div>
  );
}

/** Muestra los pasos; una vez hecha la sesión quedan plegados detrás de un botón visible. */
function Pasos({ plegados, children }: { plegados: boolean; children: ReactNode }) {
  const [abiertos, setAbiertos] = useState(false);
  const idPasos = useId();
  if (!plegados) return children;
  // Enlace desplegable, no botón: es algo secundario y no compite con las acciones de la tarjeta.
  // Se ve como una línea de texto, pero el área que responde al toque es de 48 px de alto.
  return (
    <div>
      <button
        type="button"
        aria-expanded={abiertos}
        aria-controls={idPasos}
        onClick={() => setAbiertos((a) => !a)}
        className="-my-2 inline-flex min-h-[48px] items-center gap-2 font-semibold text-oro underline-offset-4 active:underline"
      >
        {abiertos ? 'Ocultar los pasos' : 'Ver los pasos'}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-[1.1em] transition-transform ${abiertos ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {abiertos && (
        <div id={idPasos} className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/** Para lo hecho sin la app (con una mala de papel, en un retiro): abre el formulario con la práctica elegida. */
function RegistrarSinContador({ practica }: { practica: Practica }) {
  return (
    <Link to={`/registrar?que=conteo&practica=${practica}`} className={clasesBoton()}>
      Registrar sin contador
    </Link>
  );
}
