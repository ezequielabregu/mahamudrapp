import { describe, expect, it } from 'vitest';
import { analizarNavegadorIOS, enlaceParaSafari } from './navegadorIOS';

const SAFARI_26 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
const IPAD_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15';
const CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/139.0.0.0 Mobile/15E148 Safari/604.1';
const FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/142.0 Mobile/15E148 Safari/605.1.15';
const INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 390.0.0.0';
const APP_DESCONOCIDA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

describe('analizarNavegadorIOS', () => {
  it('reconoce Safari y su versión, también en iPad', () => {
    expect(analizarNavegadorIOS(SAFARI_26)).toEqual({ esSafari: true, nombre: null, versionSafari: 26 });
    expect(analizarNavegadorIOS(IPAD_SAFARI)).toMatchObject({ esSafari: true, versionSafari: 18 });
  });

  it('reconoce otros navegadores por su nombre', () => {
    expect(analizarNavegadorIOS(CHROME)).toMatchObject({ esSafari: false, nombre: 'Chrome' });
    expect(analizarNavegadorIOS(FIREFOX)).toMatchObject({ esSafari: false, nombre: 'Firefox' });
    expect(analizarNavegadorIOS(INSTAGRAM)).toMatchObject({ esSafari: false, nombre: 'Instagram' });
  });

  it('una app que muestra la página por dentro no es Safari, aunque no se sepa cuál es', () => {
    expect(analizarNavegadorIOS(APP_DESCONOCIDA)).toEqual({
      esSafari: false,
      nombre: null,
      versionSafari: null,
    });
  });
});

describe('enlaceParaSafari', () => {
  it('convierte la dirección al enlace que abre Safari', () => {
    expect(enlaceParaSafari('https://ezequielabregu.github.io/mahamudrapp/')).toBe(
      'x-safari-https://ezequielabregu.github.io/mahamudrapp/',
    );
    expect(enlaceParaSafari('http://192.168.0.10:5173/')).toBe('x-safari-http://192.168.0.10:5173/');
  });
});
