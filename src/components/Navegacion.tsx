import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { IconoAjustes, IconoAvance, IconoMeditacion } from './IconosNavegacion';

/**
 * Tres pestañas, cada una con ícono y nombre. Programa se abre desde Hoy; Registrar, Copia e
 * Instalar, desde Ajustes: la pestaña de la que salen queda marcada.
 */
const destinos: { a: string; texto: string; icono: ReactNode; tambien: string[] }[] = [
  { a: '/', texto: 'Hoy', icono: <IconoMeditacion />, tambien: ['/programa'] },
  { a: '/avance', texto: 'Avance', icono: <IconoAvance />, tambien: [] },
  {
    a: '/ajustes',
    texto: 'Ajustes',
    icono: <IconoAjustes />,
    tambien: ['/registrar', '/respaldo', '/instalar'],
  },
];

export function Navegacion() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl gap-1 px-1">
        {destinos.map((d) => (
          <li key={d.a} className="min-w-0 flex-1">
            <NavLink
              to={d.a}
              end={d.a === '/'}
              className={({ isActive }) => {
                const activa = isActive || d.tambien.includes(pathname);
                return (
                  // Con letra muy grande en un teléfono angosto, las etiquetas se achican hasta caber.
                  // Sin contorno de foco: Chrome en Android a veces lo muestra al tocar, como un cuadrado
                  // amarillo. La pestaña activa se marca con el ícono y el texto dorados y la rayita.
                  'group flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 pt-1.5 text-[min(0.95rem,4.6vw)] ' +
                  'outline-none focus-visible:outline-none ' +
                  (activa ? 'activa font-bold text-oro' : 'text-tenue')
                );
              }}
            >
              {d.icono}
              <span className="leading-tight">{d.texto}</span>
              <span
                aria-hidden="true"
                className="mt-0.5 h-1 w-6 rounded-full bg-transparent group-focus-visible:bg-borde group-[.activa]:bg-oro"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
