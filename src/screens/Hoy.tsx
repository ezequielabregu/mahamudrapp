import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useLocation, useOutletContext } from 'react-router';
import { Aviso } from '../components/Aviso';
import { clasesBoton } from '../components/estilos';
import { Seccion } from '../components/Seccion';
import { repositorio, totalBorrador } from '../db/repositorio';
import {
  formatearFechaCorta,
  formatearFechaLarga,
  formatearMinutos,
  formatearNumero,
  haceCuanto,
} from '../domain/formato';
import { programa, type Guia } from '../domain/programa';
import { useDia } from '../hooks/useDia';
import { useHoy } from '../hooks/useHoy';
import { useInstalacion } from '../hooks/useInstalacion';
import { usePreferencias } from '../hooks/usePreferencias';
import type { ContextoLayout } from '../App';

export function Hoy() {
  const hoy = useHoy();
  const prefs = usePreferencias();
  const dia = useDia(hoy, prefs);
  const borradores = useLiveQuery(() => repositorio.borradores(), []);
  const instalacion = useInstalacion();
  const { actualizacionLista, actualizar } = useOutletContext<ContextoLayout>();
  const mensaje = (useLocation().state as { mensaje?: string } | null)?.mensaje;

  if (!prefs || !dia) return null;
  const { info, resumen } = dia;
  const pendientes = (borradores ?? []).filter((b) => totalBorrador(b) > 0);
  const sugerirInstalar = !instalacion.instalada && instalacion.sistema !== 'otro';

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{formatearFechaLarga(hoy)}</h1>
        {info && (
          <p className="text-tenue">
            {info.trimestre}º trimestre · día {info.diaDelTrimestre} de {info.diasDelTrimestre}
            {info.anioPractica > 1 && ` · año ${info.anioPractica}`}
          </p>
        )}
      </header>

      {mensaje && <p role="status">{mensaje}</p>}

      {sugerirInstalar && (
        <Aviso>
          <p>Para no perder tus registros, instalá la app en tu teléfono antes de empezar a usarla.</p>
          <Link to="/instalar" className={clasesBoton()}>
            Cómo instalarla
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
        <Seccion titulo="Todavía no empezó el año de práctica">
          <p>Empieza el {formatearFechaCorta(prefs.fechaInicio)}. Podés cambiar la fecha en Ajustes.</p>
        </Seccion>
      ) : (
        <>
          <Seccion
            titulo="Sesión de Shiné"
            estado={
              resumen.shine.sesiones > 0 ? `Hecha · ${formatearMinutos(resumen.shine.segundos)}` : 'Pendiente'
            }
          >
            <Paso etiqueta="Reflexión" guia={info.reflexion} />
            <Paso etiqueta="Soporte" guia={info.soporte} />
            <Link to="/registrar?que=sesion" className={clasesBoton('principal')}>
              {resumen.shine.sesiones > 0 ? 'Registrar otra sesión' : 'Registrar la sesión de hoy'}
            </Link>
          </Seccion>

          <Seccion
            titulo={programa.practicas[resumen.preliminar.practica].titulo}
            estado={`Hoy: ${formatearNumero(resumen.preliminar.hoy)}`}
          >
            <p>
              En el trimestre: {formatearNumero(resumen.preliminar.trimestre)}
              {resumen.preliminar.metaTrimestre > 0 &&
                ` de ${formatearNumero(resumen.preliminar.metaTrimestre)}`}
            </p>
            {resumen.preliminar.metaDiaria && (
              <p className="text-tenue">Sugerido por día: {formatearNumero(resumen.preliminar.metaDiaria)}</p>
            )}
            <Link to={`/contador/${resumen.preliminar.practica}`} className={clasesBoton('principal')}>
              Contar {programa.practicas[resumen.preliminar.practica].unidad}
            </Link>
          </Seccion>

          <Seccion
            titulo={programa.practicas.chenresi.titulo}
            estado={`Hoy: ${formatearNumero(resumen.chenresi.hoy)}`}
          >
            <p>
              En el año: {formatearNumero(resumen.chenresi.anio)} de{' '}
              {formatearNumero(resumen.chenresi.metaAnio)}
            </p>
            <Link to="/contador/chenresi" className={clasesBoton()}>
              Contar mantras
            </Link>
          </Seccion>
        </>
      )}

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
          <p className="text-tenue">Última copia de seguridad: {haceCuanto(dia.ultimaCopia, hoy)}.</p>
        )
      )}

      {actualizacionLista && (
        <Aviso>
          <p>Hay una versión nueva de la app.</p>
          <button type="button" className={clasesBoton()} onClick={actualizar}>
            Actualizar ahora
          </button>
        </Aviso>
      )}
    </div>
  );
}

function Paso({ etiqueta, guia }: { etiqueta: string; guia: Guia }) {
  return (
    <div>
      <p>
        <span className="text-tenue">{etiqueta}: </span>
        <span className="font-semibold">{guia.titulo}</span>
        {guia.pagina && <span className="text-tenue"> (libro, p. {guia.pagina})</span>}
      </p>
      {guia.nota && <p className="text-tenue">{guia.nota}</p>}
    </div>
  );
}
