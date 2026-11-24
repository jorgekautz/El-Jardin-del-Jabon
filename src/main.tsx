import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

/* Tipografías del sitio: display serif, texto humanista y monoespaciada para cantidades. */
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/karla/latin-400.css';
import '@fontsource/karla/latin-500.css';
import '@fontsource/karla/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/print.css';

import { App } from './App';
import { AppProvider } from './store/AppStore';
import { ToastProvider } from './store/toasts';

const container = document.getElementById('root');
if (!container) throw new Error('Falta el elemento #root de index.html');

createRoot(container).render(
  <StrictMode>
    {/* Si publicas en una subcarpeta, pon aquí `basename="/subcarpeta"` con el mismo
        valor que `base` en `vite.config.ts`. */}
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
