import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Modules from './pages/Modules';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="*" element={<Navigate to="/modules" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
