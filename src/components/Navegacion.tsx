import { NavLink, useLocation } from 'react-router';

/** Tres pestañas. Registrar, Copia e Instalar viven dentro de Ajustes. */
const destinos = [
  { a: '/', texto: 'Hoy', tambien: [] },
  { a: '/programa', texto: 'Programa', tambien: [] },
  { a: '/ajustes', texto: 'Ajustes', tambien: ['/registrar', '/respaldo', '/instalar'] },
];

export function Navegacion() {
  const { pathname } = useLocation();
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
              className={({ isActive }) => {
                const activa = isActive || d.tambien.includes(pathname);
                return (
                  'group flex min-h-[3.25rem] flex-col items-center justify-center gap-1 ' +
                  (activa ? 'activa font-bold text-acento' : 'text-tenue')
                );
              }}
            >
              <span>{d.texto}</span>
              <span
                aria-hidden="true"
                className="h-1 w-6 rounded-full bg-transparent group-[.activa]:bg-oro"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
