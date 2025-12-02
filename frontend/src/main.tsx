import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Modules from './pages/Modules';
import Onboarding from './pages/Onboarding';
import ExercisePage from './pages/Exercise';
import Test from './pages/Test';
import Resources from './pages/Resources';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/test" element={<Test />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/exercise/:id" element={<ExercisePage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
