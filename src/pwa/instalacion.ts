// Detección del sistema y del estado de instalación. El evento beforeinstallprompt
// (solo Chrome y derivados, sobre todo Android) llega una vez al cargar: se escucha
// desde el arranque y se guarda para ofrecer el botón "Instalar app" más tarde.

export type Sistema = 'ios' | 'android' | 'otro';

interface EventoInstalacion extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let eventoPendiente: EventoInstalacion | null = null;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

export function escucharInstalacion(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoPendiente = e as EventoInstalacion;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    eventoPendiente = null;
    avisar();
  });
}

export function suscribirInstalacion(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function puedeInstalarDirecto(): boolean {
  return eventoPendiente !== null;
}

/** Abre el diálogo del navegador. Devuelve true si la persona aceptó. */
export async function instalar(): Promise<boolean> {
  if (!eventoPendiente) return false;
  const evento = eventoPendiente;
  eventoPendiente = null;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  avisar();
  return outcome === 'accepted';
}

export function estaInstalada(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

export function detectarSistema(): Sistema {
  const ua = navigator.userAgent;
  // El iPad con iPadOS se presenta como Mac; se lo distingue por la pantalla táctil.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'otro';
}
