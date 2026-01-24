
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('MIROMA AI v1.0.1 - Inicializando com suporte a Mapas Logísticos');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
