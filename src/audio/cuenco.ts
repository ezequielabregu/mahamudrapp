// Cuenco tibetano sintetizado con Web Audio: no hay archivos que descargar ni licencias que
// anotar, y funciona sin conexión. Un cuenco real tiene parciales inarmónicos (no múltiplos
// enteros de la fundamental) que decaen despacio, y cada uno "late" porque el cuenco no es
// perfectamente simétrico: eso se imita con pares de osciladores apenas desafinados.

import { obtenerContexto } from './contexto';

/** [relación con la fundamental, amplitud relativa, segundos hasta casi apagarse] */
const PARCIALES: [number, number, number][] = [
  [1, 1, 14],
  [2.72, 0.42, 10],
  [5.12, 0.2, 7],
  [8.3, 0.09, 4.5],
  [12.2, 0.04, 3],
];
const FUNDAMENTAL_HZ = 196;
const BATIDO_HZ = 0.7;
const VOLUMEN = 0.32;
const SEPARACION_GOLPES = 4.5;

/** Agenda los golpes de cuenco en el reloj de audio. Devuelve una función que los cancela. */
function agendar(ctx: AudioContext, inicio: number, golpes: number): () => void {
  const salida = ctx.createGain();
  salida.gain.value = VOLUMEN;
  salida.connect(ctx.destination);
  const osciladores: OscillatorNode[] = [];

  for (let g = 0; g < golpes; g++) {
    const t = inicio + g * SEPARACION_GOLPES;
    for (const [relacion, amplitud, duracion] of PARCIALES) {
      for (const desvio of [-BATIDO_HZ / 2, BATIDO_HZ / 2]) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = FUNDAMENTAL_HZ * relacion + desvio * relacion;
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime((amplitud / 2) * 0.9, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
        osc.connect(env).connect(salida);
        osc.start(t);
        osc.stop(t + duracion + 0.1);
        osciladores.push(osc);
      }
    }
  }

  return () => {
    const ahora = ctx.currentTime;
    salida.gain.cancelScheduledValues(ahora);
    salida.gain.setValueAtTime(salida.gain.value, ahora);
    salida.gain.linearRampToValueAtTime(0, ahora + 0.05);
    for (const osc of osciladores) {
      try {
        osc.stop(ahora + 0.06);
      } catch {
        // Ya estaba detenido.
      }
    }
  };
}

/** Un golpe de cuenco ahora (comienzo de la sesión). Llamar desde un toque del usuario. */
export function sonarCuencoInicio(): void {
  const ctx = obtenerContexto();
  if (ctx) agendar(ctx, ctx.currentTime + 0.05, 1);
}

export interface CuencoAgendado {
  cancelar: () => void;
  /** Momento, en el reloj de audio, en que empieza a sonar. */
  cuando: number;
}

/**
 * Agenda los tres golpes del final dentro de `segundos`. Al quedar en el reloj de audio, suenan
 * a tiempo aunque el navegador frene el JavaScript con la pantalla encendida. null si no hay audio.
 */
export function agendarCuencoFinal(segundos: number): CuencoAgendado | null {
  const ctx = obtenerContexto();
  if (!ctx) return null;
  const cuando = ctx.currentTime + Math.max(0.05, segundos);
  return { cancelar: agendar(ctx, cuando, 3), cuando };
}

/**
 * Al cumplirse el tiempo: si el cuenco agendado no va a sonar ya (el sistema pausó el reloj de
 * audio con la app en segundo plano, o no había nada agendado), lo cancela y suena ahora.
 */
export function asegurarCuencoFinal(agendado: CuencoAgendado | null): void {
  const ctx = obtenerContexto();
  if (!ctx) return;
  if (agendado && agendado.cuando - ctx.currentTime < 1.5) return;
  agendado?.cancelar();
  agendar(ctx, ctx.currentTime + 0.05, 3);
}

/** ¿El audio está habilitado? En iOS hace falta un toque del usuario después de abrir la app. */
export function audioHabilitado(): boolean {
  return obtenerContexto()?.state === 'running';
}
