import { NavLink } from 'react-router';

const destinos = [
  { a: '/', texto: 'Hoy' },
  { a: '/registrar', texto: 'Registrar' },
  { a: '/respaldo', texto: 'Copia' },
  { a: '/ajustes', texto: 'Ajustes' },
];

export function Navegacion() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl px-2">
        {destinos.map((d) => (
          <li key={d.a} className="flex-1">
            <NavLink
              to={d.a}
              end={d.a === '/'}
              className={({ isActive }) =>
                'flex min-h-[3.25rem] flex-col items-center justify-center gap-1 ' +
                (isActive ? 'font-bold text-acento' : 'text-tenue')
              }
            >
              {({ isActive }) => (
                <>
                  <span>{d.texto}</span>
                  <span
                    aria-hidden="true"
                    className={`h-1 w-6 rounded-full ${isActive ? 'bg-oro' : 'bg-transparent'}`}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
