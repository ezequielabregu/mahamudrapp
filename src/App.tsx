import { useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router';
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

export interface ContextoLayout {
  actualizacionLista: boolean;
  actualizar: () => void;
}

/** Normal = 20 px de base. Chica (18 px) queda por debajo del mínimo recomendado: es una elección de cada persona. */
const FACTOR_ESCALA: Record<EscalaTexto, number> = { chica: 0.9, normal: 1, grande: 1.15, 'muy-grande': 1.3 };

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

const router = createHashRouter([
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
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
  const escala = usePreferencias()?.escalaTexto ?? 'normal';

  useEffect(() => {
    document.documentElement.style.fontSize = `${125 * FACTOR_ESCALA[escala]}%`;
  }, [escala]);

  return <RouterProvider router={router} />;
}
