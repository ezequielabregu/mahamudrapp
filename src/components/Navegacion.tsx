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
      className="fixed inset-x-0 bottom-0 border-t border-borde bg-superficie pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {destinos.map((d) => (
          <li key={d.a} className="flex-1">
            <NavLink
              to={d.a}
              end={d.a === '/'}
              className={({ isActive }) =>
                'flex min-h-[3rem] items-center justify-center text-base ' +
                (isActive ? 'font-bold text-acento underline underline-offset-4' : 'text-tenue')
              }
            >
              {d.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
