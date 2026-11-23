import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import './theme.css'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak.js'

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
  .then((authenticated) => {
    if (authenticated) {
      window._keycloak = keycloak;
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <PrimeReactProvider>
            <App />
          </PrimeReactProvider>
        </StrictMode>
      );
    } else {
      keycloak.login();
    }
  }).catch((error) => {
    console.error('Erro ao inicializar Keycloak:', error);
  });