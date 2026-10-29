import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BlogProvider } from './context/BlogContext';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/forms.css';
import './styles/reading.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter><AuthProvider><BlogProvider><App /></BlogProvider></AuthProvider></BrowserRouter>
  </StrictMode>,
);
