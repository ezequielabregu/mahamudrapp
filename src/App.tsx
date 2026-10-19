import { useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Navegacion } from './components/Navegacion';
import type { EscalaTexto } from './db/repositorio';
import { usePreferencias } from './hooks/usePreferencias';
import { Ajustes } from './screens/Ajustes';
import { Contador } from './screens/Contador';
import { Hoy } from './screens/Hoy';
import { Instalar } from './screens/Instalar';
import { Registrar } from './screens/Registrar';
import { Respaldo } from './screens/Respaldo';

export interface ContextoLayout {
  actualizacionLista: boolean;
  actualizar: () => void;
}

const FACTOR_ESCALA: Record<EscalaTexto, number> = { normal: 1, grande: 1.15, 'muy-grande': 1.3 };

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
