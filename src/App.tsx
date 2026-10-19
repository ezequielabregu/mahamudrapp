import { useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider, ScrollRestoration } from 'react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Navegacion } from './components/Navegacion';
import type { EscalaTexto } from './db/repositorio';
import { usePreferencias } from './hooks/usePreferencias';
import { Ajustes } from './screens/Ajustes';
import { Contador } from './screens/Contador';
import { Estadisticas } from './screens/Estadisticas';
import { Hoy } from './screens/Hoy';
import { Instalar } from './screens/Instalar';
import { Programa } from './screens/Programa';
import { Registrar } from './screens/Registrar';
import { Respaldo } from './screens/Respaldo';
import { SesionShine } from './screens/SesionShine';
import { aplicarApariencia } from './tema';

export interface ContextoLayout {
  actualizacionLista: boolean;
  actualizar: () => void;
}

/** Pequeño (18 px de base) es el tamaño por defecto, elegido por el autor; Normal = 20 px. */
const FACTOR_ESCALA: Record<EscalaTexto, number> = {
  pequeno: 0.9,
  normal: 1,
  grande: 1.15,
  'muy-grande': 1.3,
};

function Layout() {
  const {
    needRefresh: [actualizacionLista],
    updateServiceWorker,
  } = useRegisterSW();
  const contexto: ContextoLayout = {
    actualizacionLista,
    actualizar: () => void updateServiceWorker(),
  };

  return (
    <>
      <main className="pt-[env(safe-area-inset-top)]">
        <Outlet context={contexto} />
      </main>
      <Navegacion />
    </>
  );
}

/** Raíz de todas las pantallas: cada pantalla nueva abre arriba; al volver atrás, donde estaba. */
function Raiz() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const router = createHashRouter([
  {
    element: <Raiz />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Hoy /> },
          { path: 'programa', element: <Programa /> },
          { path: 'avance', element: <Estadisticas /> },
          { path: 'registrar', element: <Registrar /> },
          { path: 'respaldo', element: <Respaldo /> },
          { path: 'ajustes', element: <Ajustes /> },
          { path: 'instalar', element: <Instalar /> },
        ],
      },
      { path: 'contador/:practica', element: <Contador /> },
      { path: 'sesion/shine', element: <SesionShine /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  const prefs = usePreferencias();
  const escala = prefs?.escalaTexto ?? 'pequeno';
  const apariencia = prefs?.apariencia;

  useEffect(() => {
    document.documentElement.style.fontSize = `${125 * FACTOR_ESCALA[escala]}%`;
  }, [escala]);

  useEffect(() => (apariencia ? aplicarApariencia(apariencia) : undefined), [apariencia]);

  return <RouterProvider router={router} />;
}
