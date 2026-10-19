import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { BarraProgreso } from '../components/BarraProgreso';
import { GraficoSemanas } from '../components/GraficoSemanas';
import { MapaDeCalor } from '../components/MapaDeCalor';
import { Pantalla } from '../components/Pantalla';
import { Tarjeta } from '../components/Tarjeta';
import { repositorio, type Preferencias } from '../db/repositorio';
import type { Conteo, Sesion } from '../db/schema';
import { infoDelDia, type InfoDelDia } from '../domain/calendario';
import { sumarConteos } from '../domain/conteos';
import {
  minutosPorDia,
  minutosPorSemana,
  proyeccion,
  rachas,
  regularidad,
  resumenCarnet,
  type FilaCarnet,
} from '../domain/estadisticas';
import { diasEntre, sumarDias } from '../domain/fechas';
import { contar, formatearFechaCorta, formatearNumero } from '../domain/formato';
import { metasDelNivel, type Metas } from '../domain/niveles';
import { programa, type NumeroTrimestre } from '../domain/programa';
import { rangoDelTrimestre } from '../domain/semana';
import { useHoy } from '../hooks/useHoy';
import { usePreferencias } from '../hooks/usePreferencias';

const SEMANAS_EN_GRAFICO = 12;

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

function Panel({ hoy, info, prefs, sesiones, conteos }: PropsPanel) {
  const metas = metasDelNivel(prefs.nivel, prefs.compromiso, programa);
  const anio = regularidad(sesiones, info.inicioAnio, hoy);
  const racha = rachas(sesiones, hoy);
  const semanas = minutosPorSemana(sesiones, hoy, SEMANAS_EN_GRAFICO);
  const carnet = resumenCarnet(sesiones, conteos, prefs.fechaInicio, hoy);
  const etiquetaAnio = carnet.at(-1)?.etiqueta ?? '';

  return (
    <Pantalla antetitulo={`Año ${info.anioPractica} · ${etiquetaAnio}`} titulo="Avance">
      <Tarjeta antetitulo="Meditación" titulo="Regularidad del año">
        <div>
          <p className="text-[3.5rem] leading-none font-semibold">{anio.porcentaje}%</p>
          <p className="mt-2 text-tenue">
            {contar(anio.practicados, 'día', 'días')} con Shiné de{' '}
            {contar(anio.dias, 'día transcurrido', 'días transcurridos')}.
          </p>
        </div>
        <dl className="space-y-2">
          <Dato etiqueta="Racha actual">{contar(racha.actual, 'día', 'días')}</Dato>
          <Dato etiqueta="Racha más larga">{contar(racha.maxima, 'día', 'días')}</Dato>
          <Dato etiqueta="Esta semana">{`${formatearNumero(semanas.at(-1)?.minutos ?? 0)} minutos`}</Dato>
        </dl>
      </Tarjeta>

      <TarjetaPreliminar info={info} metas={metas} conteos={conteos} />
      <TarjetaChenresi hoy={hoy} info={info} metas={metas} conteos={conteos} />
      {metas.yidam && <TarjetaYidam yidam={metas.yidam} conteos={conteos} />}

      <Tarjeta
        antetitulo="Meditación"
        titulo="Minutos por semana"
        subtitulo={`Shiné, últimas ${SEMANAS_EN_GRAFICO} semanas`}
      >
        <GraficoSemanas semanas={semanas} referencia={programa.minutosMeditacionDiaria * 7} />
      </Tarjeta>

      <CalendarioPorTrimestre hoy={hoy} info={info} sesiones={sesiones} />

      <TarjetaCarnet filas={carnet} />
    </Pantalla>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-2">
      <dt className="text-tenue">{etiqueta}</dt>
      <dd className="text-right font-semibold">{children}</dd>
    </div>
  );
}

function Total(props: { valor: number; meta: number | null; etiqueta: string }) {
  return (
    <div className="space-y-2">
      <p>
        <span className="text-[2.25rem] leading-none font-semibold">{formatearNumero(props.valor)}</span>
        {props.meta ? <span className="text-tenue"> de {formatearNumero(props.meta)}</span> : null}
      </p>
      {props.meta ? (
        <BarraProgreso valor={props.valor} maximo={props.meta} etiqueta={props.etiqueta} />
      ) : null}
    </div>
  );
}

function TarjetaPreliminar(props: { info: InfoDelDia; metas: Metas; conteos: Conteo[] }) {
  const { info, metas, conteos } = props;
  if (metas.preliminarTrimestre === null) return null;
  const practica = info.preliminar;
  const datos = programa.practicas[practica];
  const total = sumarConteos(conteos, { practica, desde: info.inicioTrimestre, hasta: info.finTrimestre });
  const meta = metas.preliminarTrimestre;
  const p = proyeccion(total, meta, info.diaDelTrimestre, info.diasDelTrimestre);

  return (
    <Tarjeta antetitulo={`${info.trimestre}º trimestre · preliminar`} titulo={datos.titulo}>
      <Total valor={total} meta={meta || null} etiqueta={`${datos.titulo} en el trimestre`} />
      <dl className="space-y-2">
        <Dato etiqueta="Promedio por día">{formatearNumero(Math.round(p.ritmoDiario))}</Dato>
        <Dato etiqueta="Al final del trimestre, a este ritmo">{formatearNumero(p.proyectado)}</Dato>
        {meta > 0 && (
          <Dato etiqueta="Para llegar a la meta, por día">
            {p.faltanPorDia === null ? 'Meta cumplida' : formatearNumero(p.faltanPorDia)}
          </Dato>
        )}
        <Dato etiqueta="Días que quedan">
          {formatearNumero(info.diasDelTrimestre - info.diaDelTrimestre + 1)}
        </Dato>
      </dl>
    </Tarjeta>
  );
}

function TarjetaChenresi(props: { hoy: string; info: InfoDelDia; metas: Metas; conteos: Conteo[] }) {
  const { hoy, info, metas, conteos } = props;
  const total = sumarConteos(conteos, { practica: 'chenresi', desde: info.inicioAnio, hasta: info.finAnio });
  const meta = metas.chenresiAnual;
  const p = proyeccion(
    total,
    meta ?? 0,
    diasEntre(info.inicioAnio, hoy) + 1,
    diasEntre(info.inicioAnio, info.finAnio),
  );

  return (
    <Tarjeta antetitulo={meta === null ? 'Durante el año · optativo' : 'Durante el año'} titulo="Chenresi">
      <Total valor={total} meta={meta} etiqueta="Mantras de Chenresi en el año" />
      <dl className="space-y-2">
        <Dato etiqueta="Promedio por día">{formatearNumero(Math.round(p.ritmoDiario))}</Dato>
        <Dato etiqueta="Al final del año, a este ritmo">{formatearNumero(p.proyectado)}</Dato>
        {meta !== null && (
          <Dato etiqueta="Para llegar a la meta, por día">
            {p.faltanPorDia === null ? 'Meta cumplida' : formatearNumero(p.faltanPorDia)}
          </Dato>
        )}
      </dl>
    </Tarjeta>
  );
}

function TarjetaYidam(props: { yidam: NonNullable<Metas['yidam']>; conteos: Conteo[] }) {
  const { yidam, conteos } = props;
  const datos = programa.practicas[yidam.practica];
  const total = sumarConteos(conteos, { practica: yidam.practica });
  return (
    <Tarjeta antetitulo="Acumulado de todos los años" titulo="Yidam" subtitulo={datos.titulo}>
      <Total valor={total} meta={yidam.meta} etiqueta={datos.titulo} />
    </Tarjeta>
  );
}

const TRIMESTRES: NumeroTrimestre[] = [1, 2, 3, 4];

function CalendarioPorTrimestre(props: { hoy: string; info: InfoDelDia; sesiones: Sesion[] }) {
  const { hoy, info, sesiones } = props;
  const [elegido, setElegido] = useState<NumeroTrimestre>(info.trimestre);
  const rango = rangoDelTrimestre(info.inicioAnio, elegido, programa);
  const hasta = sumarDias(rango.hasta, 1);
  const minutos = minutosPorDia(sesiones, rango.desde, hasta);
  const reg = regularidad(sesiones, rango.desde, hoy < rango.hasta ? hoy : rango.hasta);

  return (
    <Tarjeta antetitulo="Meditación" titulo="Calendario del trimestre">
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
        <>
          <p className="text-tenue">
            Regularidad del trimestre: <span className="font-semibold text-tinta">{reg.porcentaje}%</span> (
            {contar(reg.practicados, 'día', 'días')} de {reg.dias})
          </p>
          <MapaDeCalor desde={rango.desde} hasta={hasta} hoy={hoy} minutos={minutos} />
        </>
      )}
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
