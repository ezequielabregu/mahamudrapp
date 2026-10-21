import { useState } from 'react';
import { Pantalla } from '../components/Pantalla';
import { Tarjeta } from '../components/Tarjeta';
import { infoDelDia } from '../domain/calendario';
import { formatearDiaYMes, formatearNumero } from '../domain/formato';
import { metasDelNivel } from '../domain/niveles';
import { programa, type NumeroTrimestre } from '../domain/programa';
import { rangoDelTrimestre, semanaDelTrimestre } from '../domain/semana';
import { useHoy } from '../hooks/useHoy';
import { usePreferencias } from '../hooks/usePreferencias';

const TRIMESTRES: NumeroTrimestre[] = [1, 2, 3, 4];

export function Programa() {
  const hoy = useHoy();
  const prefs = usePreferencias();
  if (!prefs) return null;
  const info = infoDelDia(hoy, prefs.fechaInicio, programa);
  return (
    <SemanaPorTrimestre
      trimestreActual={info?.trimestre ?? null}
      diaActual={info?.nombreDia ?? null}
      inicioAnio={info?.inicioAnio ?? prefs.fechaInicio}
      metaPreliminar={metasDelNivel(prefs.nivel, prefs.compromiso, programa).preliminarTrimestre}
    />
  );
}

interface Props {
  trimestreActual: NumeroTrimestre | null;
  diaActual: string | null;
  inicioAnio: string;
  metaPreliminar: number | null;
}

function SemanaPorTrimestre({ trimestreActual, diaActual, inicioAnio, metaPreliminar }: Props) {
  const [elegido, setElegido] = useState<NumeroTrimestre>(trimestreActual ?? 1);
  const semana = semanaDelTrimestre(elegido, programa);
  const rango = rangoDelTrimestre(inicioAnio, elegido, programa);
  const esActual = elegido === trimestreActual;
  const { desarrolloSesion, duranteElAnio } = programa.cuadernillo;

  return (
    <Pantalla titulo="Programa" volver={{ a: '/', texto: 'Hoy' }}>
      <div role="group" aria-label="Trimestre" className="grid grid-cols-4 gap-2">
        {TRIMESTRES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={elegido === n}
            onClick={() => setElegido(n)}
            className={
              'min-h-[3rem] rounded-full border-2 font-serif text-lg font-semibold ' +
              (elegido === n ? 'border-acento bg-acento text-sobre-acento' : 'border-borde text-tenue')
            }
          >
            {n}º
          </button>
        ))}
      </div>

      <Tarjeta
        antetitulo={`${elegido}º trimestre${esActual ? ' · en curso' : ''}`}
        titulo={programa.practicas[semana.preliminar].titulo}
        subtitulo={`Del ${formatearDiaYMes(rango.desde)} al ${formatearDiaYMes(rango.hasta)}`}
        estado={
          metaPreliminar ? (
            <span className="font-semibold text-oro">Meta: {formatearNumero(metaPreliminar)}</span>
          ) : undefined
        }
      >
        <ul className="-mx-2 divide-y divide-borde">
          {semana.dias.map((dia) => {
            const hoy = esActual && dia.id === diaActual;
            return (
              <li key={dia.id} className={`px-2 py-3 ${hoy ? 'rounded-2xl bg-resalte' : ''}`}>
                <p className="flex items-center gap-2 font-serif text-lg font-semibold">
                  {dia.nombre}
                  {hoy && (
                    <span className="rounded-full bg-oro px-2.5 font-sans text-base text-superficie">
                      Hoy
                    </span>
                  )}
                </p>
                <p>
                  <span className="text-tenue">Reflexión: </span>
                  {dia.reflexion.titulo}
                </p>
                <p>
                  <span className="text-tenue">Soporte: </span>
                  {dia.soporte.titulo}
                </p>
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <Tarjeta titulo={desarrolloSesion.titulo} subtitulo={desarrolloSesion.duracion}>
        <ol className="space-y-2">
          {desarrolloSesion.pasos.map((paso, i) => (
            <li key={paso} className="flex gap-3">
              <span className="w-6 shrink-0 text-right font-serif font-semibold text-oro">{i + 1}</span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
      </Tarjeta>

      <Tarjeta antetitulo="Durante el año" titulo="Chenresi" subtitulo={duranteElAnio} />
    </Pantalla>
  );
}
