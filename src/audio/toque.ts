// Respuesta suave a cada toque del contador. Se sintetiza con Web Audio para no depender
// de archivos. En iOS el contexto de audio solo arranca después de un toque del usuario,
// y como esto se llama desde un toque, alcanza con crearlo o reanudarlo acá.

type NavegadorConSesionDeAudio = Navigator & { audioSession?: { type: string } };

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (!contexto) {
    if (typeof AudioContext === 'undefined') return null;
    const sesion = (navigator as NavegadorConSesionDeAudio).audioSession;
    if (sesion) sesion.type = 'playback';
    contexto = new AudioContext();
  }
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}

export function sonarToque(): void {
  const ctx = obtenerContexto();
  if (!ctx) return;
  const t = ctx.currentTime;
  const oscilador = ctx.createOscillator();
  const volumen = ctx.createGain();
  oscilador.type = 'sine';
  oscilador.frequency.setValueAtTime(528, t);
  volumen.gain.setValueAtTime(0.0001, t);
  volumen.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
  volumen.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  oscilador.connect(volumen).connect(ctx.destination);
  oscilador.start(t);
  oscilador.stop(t + 0.3);
}

/** Vibración breve donde existe (Android). iOS Safari no tiene navigator.vibrate. */
export function vibrarSuave(): void {
  if (typeof navigator.vibrate === 'function') navigator.vibrate(12);
}
