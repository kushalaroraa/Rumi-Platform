import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainApp from './MainApp';
import LoginSuccess from './pages/LoginSuccess';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/dashboard" element={<MainApp forceDashboard />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
