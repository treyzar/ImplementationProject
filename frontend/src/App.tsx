import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DocumentBuilderPage } from './pages/DocumentBuilderPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/documents/builder" element={<DocumentBuilderPage />} />
        <Route path="/" element={<Navigate to="/documents/builder" replace />} />
        <Route path="*" element={<Navigate to="/documents/builder" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
