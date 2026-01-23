import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { AudiencePage } from './pages/AudiencePage';
import { WinnersPage } from './pages/WinnersPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/audience" element={<AudiencePage />} />
        <Route path="/winners" element={<WinnersPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
