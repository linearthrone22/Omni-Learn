import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './AppClean.tsx';
import './index.css';

document.title = 'Omni Learn';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
