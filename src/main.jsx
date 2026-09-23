/**
 * src/main.jsx
 * Application entry point.
 * - Imports global styles once (index.css is the single source of truth for design tokens)
 * - Wraps the app in BrowserRouter for client-side routing
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App.jsx';
import { store } from './app/store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
