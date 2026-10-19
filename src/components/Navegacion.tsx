import { NavLink, useLocation } from 'react-router';

/** Cuatro pestañas. Registrar, Copia e Instalar viven dentro de Ajustes. */
const destinos = [
  { a: '/', texto: 'Hoy', tambien: [] },
  { a: '/programa', texto: 'Programa', tambien: [] },
  { a: '/avance', texto: 'Avance', tambien: [] },
  { a: '/ajustes', texto: 'Ajustes', tambien: ['/registrar', '/respaldo', '/instalar'] },
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
                  // Con letra muy grande en un teléfono angosto, las cuatro etiquetas no entran: se achican hasta caber.
                  // Sin contorno de foco: Chrome en Android a veces lo muestra al tocar, como un cuadrado
                  // amarillo. La pestaña activa se marca con el texto dorado y la rayita, también al enfocarla.
                  'group flex min-h-[3.25rem] flex-col items-center justify-center gap-1 text-[min(1rem,5vw)] ' +
                  'outline-none focus-visible:outline-none ' +
                  (activa ? 'activa font-bold text-oro' : 'text-tenue')
                );
              }}
            >
              <span>{d.texto}</span>
              <span
                aria-hidden="true"
                className="h-1 w-6 rounded-full bg-transparent group-focus-visible:bg-borde group-[.activa]:bg-oro"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
