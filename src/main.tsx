import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { escucharInstalacion } from './pwa/instalacion';

escucharInstalacion();
// Pide al navegador que no borre la base si se queda sin espacio. El resultado se ve en Ajustes.
void navigator.storage?.persist?.();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
