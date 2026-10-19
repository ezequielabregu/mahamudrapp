// Contexto de audio único de la app. En iOS solo arranca después de un toque del usuario:
// quien lo pida desde un toque (contar, "Comenzar") lo deja habilitado para lo que siga.
// En iOS, 'playback' hace que suene aunque el interruptor de silencio esté activado.

type NavegadorConSesionDeAudio = Navigator & { audioSession?: { type: string } };

let contexto: AudioContext | null = null;

export function obtenerContexto(): AudioContext | null {
  if (!contexto) {
    if (typeof AudioContext === 'undefined') return null;
    const sesion = (navigator as NavegadorConSesionDeAudio).audioSession;
    if (sesion) sesion.type = 'playback';
    contexto = new AudioContext();
  }
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}
