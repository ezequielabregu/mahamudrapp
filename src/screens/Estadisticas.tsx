import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { BarraProgreso } from '../components/BarraProgreso';
import { GraficoColumnas } from '../components/GraficoColumnas';
import { MapaDeCalor } from '../components/MapaDeCalor';
import { Pantalla } from '../components/Pantalla';
import { Tarjeta } from '../components/Tarjeta';
import { repositorio, type Preferencias } from '../db/repositorio';
import type { Conteo, Sesion } from '../db/schema';
import { infoDelDia, type InfoDelDia } from '../domain/calendario';
import { sumarConteos } from '../domain/conteos';
import {
  mejorDia,
  minutosPorDia,
  minutosPorSemana,
  proyeccion,
  rachas,
  regularidad,
  resumenCarnet,
  resumenMeditacion,
  totalesPorDia,
  type FilaCarnet,
} from '../domain/estadisticas';
import { diasEntre, sumarDias } from '../domain/fechas';
import {
  contar,
  formatearDiaCorto,
  formatearDiaYMes,
  formatearFechaCorta,
  formatearFechaLarga,
  formatearNumero,
} from '../domain/formato';
import { metasDelNivel } from '../domain/niveles';
import { programa, type NumeroTrimestre } from '../domain/programa';
import { rangoDelTrimestre } from '../domain/semana';
import { useHoy } from '../hooks/useHoy';
import { usePreferencias } from '../hooks/usePreferencias';

const SEMANAS_EN_GRAFICO = 12;
const DIAS_EN_GRAFICO = 14;

export function Estadisticas() {
  const hoy = useHoy();
  const prefs = usePreferencias();
  const datos = useLiveQuery(async () => {
    const [sesiones, conteos] = await Promise.all([
      repositorio.todasLasSesiones(),
      repositorio.todosLosConteos(),
    ]);
    return { sesiones, conteos };
  }, []);
  if (!prefs || !datos) return null;

  const info = infoDelDia(hoy, prefs.fechaInicio, programa);
  if (!info) {
    return (
      <Pantalla titulo="Avance">
        <Tarjeta titulo="Todavía no empezó el año de práctica">
          <p>Empieza el {formatearFechaCorta(prefs.fechaInicio)}.</p>
        </Tarjeta>
      </Pantalla>
    );
  }
  return <Panel hoy={hoy} info={info} prefs={prefs} sesiones={datos.sesiones} conteos={datos.conteos} />;
}

interface PropsPanel {
  hoy: string;
  info: InfoDelDia;
  prefs: Preferencias;
  sesiones: Sesion[];
  conteos: Conteo[];
}

/** Lo que comparten las dos partes del panel, calculado una sola vez. */
function calcular({ hoy, info, prefs, conteos }: PropsPanel) {
  const metas = metasDelNivel(prefs.nivel, prefs.compromiso, programa);
  const diaDelAnio = diasEntre(info.inicioAnio, hoy) + 1;
  const diasDelAnio = diasEntre(info.inicioAnio, info.finAnio);
  const preliminar =
    metas.preliminarTrimestre === null
      ? null
      : {
          practica: info.preliminar,
          total: sumarConteos(conteos, {
            practica: info.preliminar,
            desde: info.inicioTrimestre,
            hasta: info.finTrimestre,
          }),
          meta: metas.preliminarTrimestre,
        };
  const chenresi = {
    total: sumarConteos(conteos, { practica: 'chenresi', desde: info.inicioAnio, hasta: info.finAnio }),
    meta: metas.chenresiAnual,
  };
  return { metas, diaDelAnio, diasDelAnio, preliminar, chenresi };
}

function Panel(props: PropsPanel) {
  const { hoy, info, prefs, sesiones } = props;
  const carnet = resumenCarnet(sesiones, props.conteos, prefs.fechaInicio, hoy);
  const calculo = calcular(props);

  return (
    <Pantalla antetitulo={`Año ${info.anioPractica} · ${carnet.at(-1)?.etiqueta ?? ''}`} titulo="Avance">
      <button
        type="button"
        onClick={() =>
          document.getElementById('en-numeros')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        className="min-h-[3rem] font-semibold text-acento underline underline-offset-4"
      >
        Ir a los números
      </button>

      <Encabezado titulo="De un vistazo" />
      <DeUnVistazo {...props} calculo={calculo} />

      <Encabezado titulo="En números" id="en-numeros" />
      <EnNumeros {...props} calculo={calculo} carnet={carnet} />
    </Pantalla>
  );
}

function Encabezado(props: { titulo: string; id?: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h2
        id={props.id}
        className="scroll-mt-4 font-sans font-semibold tracking-[0.08em] whitespace-nowrap text-oro uppercase"
      >
        {props.titulo}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-borde" />
    </div>
  );
}

type Calculo = ReturnType<typeof calcular>;

/* ---------- Primera parte: de un vistazo ---------- */

function DeUnVistazo(props: PropsPanel & { calculo: Calculo }) {
  const { hoy, info, sesiones, conteos, calculo } = props;
  const { metas, preliminar, chenresi } = calculo;
  const anio = regularidad(sesiones, info.inicioAnio, hoy);
  const semanas = minutosPorSemana(sesiones, hoy, SEMANAS_EN_GRAFICO);
  const metaDiaria = preliminar?.meta ? Math.ceil(preliminar.meta / info.diasDelTrimestre) : 0;
  const hayMetas = Boolean(preliminar?.meta) || chenresi.meta !== null || metas.yidam;

  return (
    <>
      <Tarjeta antetitulo="Meditación" titulo="Regularidad del año">
        <div className="space-y-3">
          <p className="text-[4rem] leading-none font-semibold">{anio.porcentaje}%</p>
          <BarraProgreso valor={anio.porcentaje} maximo={100} etiqueta="Regularidad del año" />
          <p className="text-tenue">
            {contar(anio.practicados, 'día', 'días')} con Shiné de{' '}
            {contar(anio.dias, 'día transcurrido', 'días transcurridos')}.
          </p>
        </div>
      </Tarjeta>

      {hayMetas && (
        <Tarjeta antetitulo="Metas" titulo="Cómo vas">
          {preliminar && preliminar.meta > 0 && (
            <AvanceMeta
              titulo={programa.practicas[preliminar.practica].titulo}
              valor={preliminar.total}
              meta={preliminar.meta}
              periodo="en el trimestre"
            />
          )}
          {chenresi.meta !== null && (
            <AvanceMeta titulo="Chenresi" valor={chenresi.total} meta={chenresi.meta} periodo="en el año" />
          )}
          {metas.yidam && (
            <AvanceMeta
              titulo="Yidam"
              valor={sumarConteos(conteos, { practica: metas.yidam.practica })}
              meta={metas.yidam.meta}
              periodo="acumulado"
            />
          )}
        </Tarjeta>
      )}

      <CalendarioPorTrimestre hoy={hoy} info={info} sesiones={sesiones} />

      {preliminar && (
        <Tarjeta
          antetitulo="Ritmo"
          titulo={programa.practicas[preliminar.practica].titulo}
          subtitulo={`Últimos ${DIAS_EN_GRAFICO} días`}
        >
          <GraficoColumnas
            columnas={totalesPorDia(conteos, preliminar.practica, hoy, DIAS_EN_GRAFICO).map((d) => ({
              clave: d.fecha,
              eje: formatearDiaCorto(d.fecha),
              nombre: formatearFechaLarga(d.fecha),
              valor: d.total,
            }))}
            unidad={programa.practicas[preliminar.practica].unidad}
            descripcion={`${programa.practicas[preliminar.practica].titulo} por día, últimos ${DIAS_EN_GRAFICO} días`}
            referencia={
              metaDiaria > 0
                ? {
                    valor: metaDiaria,
                    texto: `${formatearNumero(metaDiaria)} por día: lo sugerido para la meta`,
                  }
                : undefined
            }
            encabezado="Día"
          />
        </Tarjeta>
      )}

      <Tarjeta
        antetitulo="Ritmo"
        titulo="Minutos de Shiné"
        subtitulo={`Por semana, últimas ${SEMANAS_EN_GRAFICO}`}
      >
        <GraficoColumnas
          columnas={semanas.map((s) => ({
            clave: s.inicio,
            eje: formatearDiaCorto(s.inicio),
            nombre: `Semana del ${formatearDiaYMes(s.inicio)}`,
            valor: s.minutos,
          }))}
          unidad="minutos"
          descripcion={`Minutos de Shiné por semana, últimas ${SEMANAS_EN_GRAFICO} semanas`}
          referencia={{
            valor: programa.minutosMeditacionDiaria * 7,
            texto: `${programa.minutosMeditacionDiaria * 7} minutos: media hora todos los días`,
          }}
          encabezado="Semana del"
        />
      </Tarjeta>
    </>
  );
}

/** Una meta: cuánto va hecho, de cuánto y qué porcentaje, con su barra. */
function AvanceMeta(props: { titulo: string; valor: number; meta: number; periodo: string }) {
  const { titulo, valor, meta, periodo } = props;
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold">{titulo}</span>
        <span className="text-tenue">{periodo}</span>
      </p>
      <BarraProgreso valor={valor} maximo={meta} etiqueta={`${titulo} ${periodo}`} />
      <p>
        <span className="font-semibold">{formatearNumero(valor)}</span>
        <span className="text-tenue">
          {' '}
          de {formatearNumero(meta)} · {porcentaje(valor, meta)}
        </span>
      </p>
    </div>
  );
}

const TRIMESTRES: NumeroTrimestre[] = [1, 2, 3, 4];

function CalendarioPorTrimestre(props: { hoy: string; info: InfoDelDia; sesiones: Sesion[] }) {
  const { hoy, info, sesiones } = props;
  const [elegido, setElegido] = useState<NumeroTrimestre>(info.trimestre);
  const rango = rangoDelTrimestre(info.inicioAnio, elegido, programa);
  const hasta = sumarDias(rango.hasta, 1);

  return (
    <Tarjeta antetitulo="Constancia" titulo="Calendario del trimestre">
      <div role="group" aria-label="Trimestre" className="grid grid-cols-4 gap-2">
        {TRIMESTRES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={elegido === n}
            onClick={() => setElegido(n)}
            className={
              'min-h-[3rem] rounded-full border-2 font-semibold ' +
              (elegido === n ? 'border-acento bg-acento text-sobre-acento' : 'border-borde text-tenue')
            }
          >
            {n}º
          </button>
        ))}
      </div>
      {rango.desde > hoy ? (
        <p className="text-tenue">Este trimestre todavía no empezó.</p>
      ) : (
        <MapaDeCalor
          desde={rango.desde}
          hasta={hasta}
          hoy={hoy}
          minutos={minutosPorDia(sesiones, rango.desde, hasta)}
        />
      )}
    </Tarjeta>
  );
}

/* ---------- Segunda parte: en números ---------- */

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-2 first:border-t-0 first:pt-0">
      <dt className="text-tenue">{etiqueta}</dt>
      <dd className="text-right font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

function porcentaje(valor: number, meta: number): string {
  return `${Math.round((valor / meta) * 100)}%`;
}

function EnNumeros(props: PropsPanel & { calculo: Calculo; carnet: FilaCarnet[] }) {
  const { hoy, info, sesiones, conteos, calculo, carnet } = props;
  const { metas, preliminar, chenresi, diaDelAnio, diasDelAnio } = calculo;
  const anio = regularidad(sesiones, info.inicioAnio, hoy);
  const trimestre = regularidad(sesiones, info.inicioTrimestre, hoy);
  const meditacion = resumenMeditacion(sesiones, info.inicioAnio, hoy);
  const racha = rachas(sesiones, hoy);
  const estaSemana = minutosPorSemana(sesiones, hoy, 1)[0]?.minutos ?? 0;

  return (
    <>
      <Tarjeta antetitulo="Año en curso" titulo="Meditación">
        <dl className="space-y-2">
          <Dato etiqueta="Regularidad del año">{anio.porcentaje}%</Dato>
          <Dato etiqueta="Días con Shiné">
            {anio.practicados} de {anio.dias}
          </Dato>
          <Dato etiqueta="Regularidad del trimestre">{trimestre.porcentaje}%</Dato>
          <Dato etiqueta="Sesiones de Shiné">{formatearNumero(meditacion.sesiones)}</Dato>
          <Dato etiqueta="Minutos meditados">{formatearNumero(meditacion.minutos)}</Dato>
          <Dato etiqueta="Promedio por sesión">{meditacion.promedioPorSesion} min</Dato>
          <Dato etiqueta="Promedio por día">{meditacion.promedioPorDia} min</Dato>
          <Dato etiqueta="Esta semana">{formatearNumero(estaSemana)} min</Dato>
          <Dato etiqueta="Racha actual">{contar(racha.actual, 'día', 'días')}</Dato>
          <Dato etiqueta="Racha más larga">{contar(racha.maxima, 'día', 'días')}</Dato>
        </dl>
      </Tarjeta>

      {preliminar && (
        <NumerosDePractica
          antetitulo={`${info.trimestre}º trimestre`}
          titulo={programa.practicas[preliminar.practica].titulo}
          total={preliminar.total}
          meta={preliminar.meta}
          diaActual={info.diaDelTrimestre}
          diasTotales={info.diasDelTrimestre}
          mejor={mejorDia(conteos, preliminar.practica, info.inicioTrimestre, info.finTrimestre)}
          periodo="trimestre"
          extra={
            <Dato etiqueta="Acumulado de todos los años">
              {formatearNumero(sumarConteos(conteos, { practica: preliminar.practica }))}
            </Dato>
          }
        />
      )}

      <NumerosDePractica
        antetitulo={chenresi.meta === null ? 'Año en curso · optativo' : 'Año en curso'}
        titulo="Chenresi"
        total={chenresi.total}
        meta={chenresi.meta ?? 0}
        diaActual={diaDelAnio}
        diasTotales={diasDelAnio}
        mejor={mejorDia(conteos, 'chenresi', info.inicioAnio, info.finAnio)}
        periodo="año"
      />

      {metas.yidam && (
        <Tarjeta antetitulo="Acumulado de todos los años" titulo="Yidam">
          <dl className="space-y-2">
            <Dato etiqueta="Mantras">
              {formatearNumero(sumarConteos(conteos, { practica: metas.yidam.practica }))}
            </Dato>
            <Dato etiqueta="Del millón">
              {porcentaje(sumarConteos(conteos, { practica: metas.yidam.practica }), metas.yidam.meta)}
            </Dato>
          </dl>
        </Tarjeta>
      )}

      <TarjetaCarnet filas={carnet} />
    </>
  );
}

interface PropsNumeros {
  antetitulo: string;
  titulo: string;
  total: number;
  /** 0 = sin meta. */
  meta: number;
  diaActual: number;
  diasTotales: number;
  mejor: { fecha: string; total: number } | null;
  periodo: 'trimestre' | 'año';
  extra?: ReactNode;
}

function NumerosDePractica(props: PropsNumeros) {
  const { total, meta, diaActual, diasTotales, mejor, periodo } = props;
  const p = proyeccion(total, meta, diaActual, diasTotales);
  return (
    <Tarjeta antetitulo={props.antetitulo} titulo={props.titulo}>
      <dl className="space-y-2">
        <Dato etiqueta={`En el ${periodo}`}>{formatearNumero(total)}</Dato>
        {meta > 0 && <Dato etiqueta="De la meta">{porcentaje(total, meta)}</Dato>}
        <Dato etiqueta="Promedio por día">{formatearNumero(Math.round(p.ritmoDiario))}</Dato>
        <Dato etiqueta="Mejor día">
          {mejor ? `${formatearNumero(mejor.total)} (${formatearDiaCorto(mejor.fecha)})` : 'Sin registros'}
        </Dato>
        <Dato etiqueta={`Al final del ${periodo}, a este ritmo`}>{formatearNumero(p.proyectado)}</Dato>
        {meta > 0 && (
          <Dato etiqueta="Para llegar a la meta, por día">
            {p.faltanPorDia === null ? 'Meta cumplida' : formatearNumero(p.faltanPorDia)}
          </Dato>
        )}
        <Dato etiqueta="Días que quedan">{formatearNumero(Math.max(0, diasTotales - diaActual + 1))}</Dato>
        {props.extra}
      </dl>
    </Tarjeta>
  );
}

const FILAS_CARNET: { etiqueta: string; valor: (f: FilaCarnet) => number; yidam?: boolean }[] = [
  { etiqueta: 'Chenresi', valor: (f) => f.chenresi },
  { etiqueta: 'Refugio', valor: (f) => f.preliminares.postraciones },
  { etiqueta: 'Vajrasattva', valor: (f) => f.preliminares.vajrasattva },
  { etiqueta: 'Mandala', valor: (f) => f.preliminares.mandala },
  { etiqueta: 'GY', valor: (f) => f.preliminares.guruyoga },
  { etiqueta: 'Yidam ext.', valor: (f) => f.yidam['yidam-exterior'], yidam: true },
  { etiqueta: 'Yidam int.', valor: (f) => f.yidam['yidam-interior'], yidam: true },
  { etiqueta: 'Yidam sec.', valor: (f) => f.yidam['yidam-secreto'], yidam: true },
];

function TarjetaCarnet({ filas }: { filas: FilaCarnet[] }) {
  return (
    <Tarjeta
      antetitulo="Para pasar al carnet"
      titulo="Recuento de las prácticas"
      subtitulo="Chenresi: lo de cada año. Preliminares y yidam: acumulado de todos los años."
    >
      {[...filas].reverse().map((fila) => (
        <div key={fila.anio}>
          <p className="font-serif text-xl font-semibold">
            {fila.etiqueta}
            {fila.enCurso && <span className="font-sans text-base font-normal text-tenue"> · en curso</span>}
          </p>
          <dl className="mt-2 space-y-2">
            <Dato etiqueta="Meditación">{fila.meditacion}%</Dato>
            {/* Las filas de yidam solo aparecen si hay mantras registrados. */}
            {FILAS_CARNET.filter((r) => !r.yidam || r.valor(fila) > 0).map((r) => (
              <Dato key={r.etiqueta} etiqueta={r.etiqueta}>
                {formatearNumero(r.valor(fila))}
              </Dato>
            ))}
          </dl>
        </div>
      ))}
    </Tarjeta>
  );
}
