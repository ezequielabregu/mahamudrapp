// En iPhone y iPad la app se instala desde Safari ("Agregar a inicio"). Esto reconoce, por el
// user agent, si se está en Safari o en otro navegador (Chrome, Firefox, el de Instagram...),
// para ofrecer abrir la página en Safari.

export interface NavegadorIOS {
  esSafari: boolean;
  /** Nombre para mostrar cuando no es Safari; null si no se reconoce. */
  nombre: string | null;
  /** Versión de Safari (en iOS coincide con la del sistema); null si no se sabe. */
  versionSafari: number | null;
}

const OTROS: [RegExp, string][] = [
  [/CriOS\//, 'Chrome'],
  [/FxiOS\//, 'Firefox'],
  [/EdgiOS\//, 'Edge'],
  [/OPiOS\/|OPT\//, 'Opera'],
  [/DuckDuckGo\//, 'DuckDuckGo'],
  [/GSA\//, 'la app de Google'],
  [/Instagram/, 'Instagram'],
  [/FBAN|FBAV/, 'Facebook'],
  [/Line\//, 'LINE'],
];

export function analizarNavegadorIOS(ua: string): NavegadorIOS {
  for (const [patron, nombre] of OTROS) {
    if (patron.test(ua)) return { esSafari: false, nombre, versionSafari: null };
  }
  const version = /Version\/(\d+)/.exec(ua);
  // Safari se identifica con "Version/x ... Safari/". Las apps que muestran páginas por dentro
  // suelen no incluir "Safari/": se tratan como otro navegador, sin nombre.
  if (!version || !/Safari\//.test(ua)) return { esSafari: false, nombre: null, versionSafari: null };
  return { esSafari: true, nombre: null, versionSafari: Number(version[1]) };
}

/**
 * Enlace que le pide a iOS abrir la dirección en Safari (`x-safari-https://`). Apple no lo
 * documenta: funciona en iOS 15, 17 y posteriores (no en 16), por eso siempre se ofrece
 * también copiar el enlace.
 */
export function enlaceParaSafari(url: string): string {
  return url.replace(/^(https?):\/\//, 'x-safari-$1://');
}
